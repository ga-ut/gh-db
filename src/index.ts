type Data = { [key: string]: string | number | null };
type GHResponse = {
  number: number;
  title: string;
  labels: {
    id: number;
    name: string;
  }[];
  locked: boolean;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string;
};

export class GHDB {
  private url: string;
  private owner: string;
  private headers: Headers | undefined = undefined;

  constructor(params: { token: string | null; owner: string; repo: string }) {
    const { token, owner, repo } = params;
    this.owner = owner;
    this.url = `https://api.github.com/repos/${owner}/${repo}/issues`;

    if (token !== null) {
      this.headers = new Headers({
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-Github-Api-Version": "2022-11-28",
      });
    }
  }

  private async fetcher(url: string, options: RequestInit) {
    const response = await fetch(url, options);
    if (response.ok === false) {
      throw new Error(`Request failed with ${response.status}`);
    }
    return response;
  }

  async create<T extends Data>(params: {
    subject: string;
    data: T;
    tags?: string[];
    editable?: boolean;
  }) {
    const { subject, data, tags = [], editable = false } = params;
    const response = await this.fetcher(this.url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        title: subject,
        labels: [subject, ...tags],
        body: JSON.stringify(data),
      }),
    });

    const result = (await response.json()) as GHResponse;
    if (editable === false) {
      await this.fetcher(`${this.url}/${result.number}/lock`, {
        method: "PUT",
        headers: this.headers,
      });
    }

    return { id: result.number, ...data };
  }

  async readAll<T>(params: {
    subject: string;
    tags?: string[];
    options?: {
      perPage?: number;
      page?: number;
      sort?: "created" | "updated" | "comments";
      direction?: "asc" | "desc";
    };
  }) {
    const { subject, tags, options } = params;
    const {
      perPage = 30,
      page = 1,
      sort = "created",
      direction = "desc",
    } = options ?? {};

    const url = new URL(this.url);
    const searchParams = url.searchParams;
    searchParams.append("title", subject);

    const searchParamsMap = {
      labels: tags,
      per_page: perPage,
      page,
      sort,
      direction,
    } as const;

    for (const [key, value] of Object.entries(searchParamsMap)) {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    }

    searchParams.append("creator", this.owner);

    const response = await this.fetcher(url.toString(), {
      method: "GET",
      headers: this.headers,
    });

    const result = (await response.json()) as GHResponse[];

    return result
      .map((r) => {
        try {
          return { id: r.number, ...JSON.parse(r.body) };
        } catch (e) {}
      })
      .filter((r) => r !== undefined) as T[];
  }

  async readOne(id: number) {
    const response = await this.fetcher(`${this.url}/${id}`, {
      method: "GET",
      headers: this.headers,
    });

    const result = await response.json();

    return { id, ...JSON.parse(result.body) };
  }

  async update(id: number, data: Data) {
    const response = await this.fetcher(`${this.url}/${id}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({
        body: JSON.stringify(data),
      }),
    });

    const result = await response.json();

    return { id, ...JSON.parse(result.body) };
  }

  async delete(id: number) {
    await this.fetcher(`${this.url}/${id}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({
        title: id,
        body: "",
        state: "closed",
        labels: [],
      }),
    });
  }
}
