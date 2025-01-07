export class ZagwebRegistration {
  BASE_URL = "https://xe.gonzaga.edu/StudentRegistrationSsb/ssb";

  /**
   * Should look something like: JSESSIONID=XXXXXXX; X-Oracle-BMC-LBS-Route=XXXXXXX;
   *
   * You can get this by logging into Zagweb and copying the value of the
   * "Cookie" header in the network tab of the developer tools. Make sure to properly handle
   * this cookie due to its sensitive nature.
   *
   * NOTE: These are HTTP-only cookies, so they won't show up in document.cookie.
   */
  authCookies: string;

  /**
   * A unique session ID that Zagweb's backend expects. It's generated on the client
   * by combining a random 3 character string with the current timestamp.
   *
   * Could have used UUIDs. Surely nothing can go wrong with this approach (͡ ° ͜ʖ ͡ °)
   */
  uniqueSessionId: string;


  /**
   * The current mode of the session. This is used used by the backend to determine
   * what kind of data to return.
   * 
   * plan: https://xe.gonzaga.edu/StudentRegistrationSsb/ssb/term/termSelection?mode=plan
   * registration: https://xe.gonzaga.edu/StudentRegistrationSsb/ssb/term/termSelection?mode=registration
   * search: https://xe.gonzaga.edu/StudentRegistrationSsb/ssb/term/termSelection?mode=search
   */
  mode: "registration" | "search" | "plan" = "search";

  constructor(authCookies: string) {
    this.authCookies = authCookies;
    this.uniqueSessionId = this.generateUniqueSessionId();
  }

  /**
   * @returns A unique session ID
   */
  generateUniqueSessionId() {
    const randomId = Math.random().toString(36).substring(2, 5);
    const currentTimestamp = Date.now();

    return randomId + currentTimestamp;
  }

  /**
   * Searches for courses based on the provided search parameters.
   *
   * NOTE: Make sure to call the mode has been set using `changeMode`
   * before calling this method.
   *
   * @param searchParams Search parameters for the course search
   * @param pageOffset Current page offset
   * @param pageMaxSize The maximum number of results to return
   *
   * @returns A list of courses that match the search parameters
   */
  async getCourses(
    searchParams: CourseSearchParams
  ): Promise<CourseSearchResponse> {
    if (!("pageOffset" in searchParams)) {
      searchParams.pageOffset = "0";
    }

    if (!("pageMaxSize" in searchParams)) {
      searchParams.pageMaxSize = "10";
    }

    const query = new URLSearchParams({
      startDatepicker: "",
      endDatepicker: "",
      uniqueSessionId: this.uniqueSessionId,
      sortColumn: "subjectDescription",
      sortDirection: "asc",
      ...searchParams,
    });

    await this.makeRequest("/courseSearch/resetDataForm", {
      method: "POST",
      body: "resetCourses=true&resetSections=true",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    return await this.makeRequest(
      `/courseSearchResults/courseSearchResults?${query.toString()}`,
      {},
      "json"
    );
  }

  /**
   * A "Class" is a specific instance of a course that is offered in a given term.
   * A course can have multiple classes, each with different times, instructors, etc.
   *
   * NOTE: Make sure to call the mode has been set using `changeMode`
   * before calling this method.
   *
   * @param subject The subject code (e.g. "CPSC")
   * @param termId The term ID (e.g. "202520")
   *
   * @returns A list of classes for the given subject and term
   */
  async getClasses(
    searchParams: ClassSearchParams
  ): Promise<ClassSearchResponse> {
    const query = new URLSearchParams({
      uniqueSessionId: this.uniqueSessionId,
      ...searchParams,
    });

    await this.makeRequest("/classSearch/resetDataForm", {
      method: "POST",
      body: "resetCourses=true&resetSections=true",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    return await this.makeRequest(
      `/searchResults/searchResults?${query.toString()}`,
      {},
      "json"
    );
  }

  async changeMode(term: string, mode: "registration" | "search" | "plan") {
    await this.makeRequest(`/term/termSelection?mode=${mode}`);

    await this.makeRequest(`/term/search?mode=${mode}`, {
      method: "POST",
      body: new URLSearchParams({
        term: term,
        uniqueSessionId: this.uniqueSessionId,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    

    this.mode = mode;
  }

  /**
   * Get the list of classes for a specific course in a given term.
   *
   * @param subjectCourseCombo Subject and course number combined (e.g. "CPSC121")
   * @param termId The term ID (e.g. "202520")
   * @returns
   */
  async getCourseClasses(
    subjectCourseCombo: string,
    termId: string
  ): Promise<ClassSearchResponse> {
    const query = new URLSearchParams({
      txt_subjectcoursecombo: subjectCourseCombo,
      txt_term: termId,
      pageOffset: "0",
      pageMaxSize: "10",
      sortColumn: "subjectDescription",
      sortDirection: "asc",
    });

    await this.makeRequest("/searchResults/resetDataForm", {
      method: "POST",
      body: "resetCourses=true&resetSections=true",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    return await this.makeRequest(
      `/searchResults/searchResults?${query.toString()}`,
      {},
      "json"
    );
  }

  /**
   * Get the list of available terms.
   *
   * @returns A list of available terms
   */
  async getTerms(): Promise<TermsResponse> {
    let searchEndpoint = this.mode as string;

    if (this.mode === "search") {
      searchEndpoint = "classSearch";
    }

    return await this.makeRequest(`/${searchEndpoint}/getTerms?offset=1&max=10`, {}, "json");
  }

  /**
   * Makes a request with the given options and auth cookies.
   *
   * @param url The URL to make the request to
   * @param options Options for the request
   * @param responseType The expected response type. Either "json" or "text"
   *
   * @returns The response from the server
   */
  async makeRequest(
    url: string,
    options: RequestInit = {},
    responseType: "json" | "text" = "text"
  ) {
    if (!options.headers) {
      options.headers = {};
    }

    options.headers["Cookie"] = this.authCookies;

    let response = await fetch(`${this.BASE_URL}${url}`, options);

    if (responseType === "json") {
      return await response.json();
    } else if (responseType === "text") {
      return await response.text();
    }

    throw new Error("Invalid response type");
  }
}
