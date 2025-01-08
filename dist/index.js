// src/ZagwebRegistration.ts
class ZagwebRegistration {
  BASE_URL = "https://xe.gonzaga.edu/StudentRegistrationSsb/ssb";
  authCookies;
  uniqueSessionId;
  mode = "search";
  constructor(authCookies) {
    this.authCookies = authCookies;
    this.uniqueSessionId = this.generateUniqueSessionId();
  }
  generateUniqueSessionId() {
    const randomId = Math.random().toString(36).substring(2, 5);
    const currentTimestamp = Date.now();
    return randomId + currentTimestamp;
  }
  async getCourses(searchParams) {
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
      ...searchParams
    });
    await this.makeRequest("/courseSearch/resetDataForm", {
      method: "POST",
      body: "resetCourses=true&resetSections=true",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      }
    });
    return await this.makeRequest(`/courseSearchResults/courseSearchResults?${query.toString()}`, {}, "json");
  }
  async getClasses(searchParams) {
    const query = new URLSearchParams({
      uniqueSessionId: this.uniqueSessionId,
      ...searchParams
    });
    await this.makeRequest("/classSearch/resetDataForm", {
      method: "POST",
      body: "resetCourses=true&resetSections=true",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      }
    });
    return await this.makeRequest(`/searchResults/searchResults?${query.toString()}`, {}, "json");
  }
  async changeMode(term, mode) {
    await this.makeRequest(`/term/termSelection?mode=${mode}`);
    await this.makeRequest(`/term/search?mode=${mode}`, {
      method: "POST",
      body: new URLSearchParams({
        term,
        uniqueSessionId: this.uniqueSessionId
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      }
    });
    this.mode = mode;
  }
  async getCourseClasses(subjectCourseCombo, termId) {
    const query = new URLSearchParams({
      txt_subjectcoursecombo: subjectCourseCombo,
      txt_term: termId,
      pageOffset: "0",
      pageMaxSize: "10",
      sortColumn: "subjectDescription",
      sortDirection: "asc"
    });
    await this.makeRequest("/searchResults/resetDataForm", {
      method: "POST",
      body: "resetCourses=true&resetSections=true",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      }
    });
    return await this.makeRequest(`/searchResults/searchResults?${query.toString()}`, {}, "json");
  }
  async getTerms() {
    let searchEndpoint = this.mode;
    if (this.mode === "search") {
      searchEndpoint = "classSearch";
    }
    return await this.makeRequest(`/${searchEndpoint}/getTerms?offset=1&max=10`, {}, "json");
  }
  async makeRequest(url, options = {}, responseType = "text") {
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

// src/index.ts
async function init() {
  const zagwebRegistration = new ZagwebRegistration("");
  console.log("Getting terms...");
  const terms = await zagwebRegistration.getTerms();
  const promptText = terms.map((term, index) => `${index + 1}. ${term.description}`).join("\n");
  let promptResult = prompt(promptText);
  while (promptResult === null) {
    promptResult = prompt(promptText);
  }
  const termIndex = parseInt(promptResult) - 1;
  const selectedTerm = terms[termIndex];
  const termCode = selectedTerm.code;
  const termName = selectedTerm.description;
  console.log("Changing mode to search...");
  await zagwebRegistration.changeMode(termCode, "search");
  console.log("Getting all courses...");
  const allCoursesResponse = await zagwebRegistration.getCourses({
    txt_term: termCode,
    txt_subject: "CPSC",
    pageMaxSize: "100"
  });
  const allCourses = Object.fromEntries(allCoursesResponse.data.map((course) => {
    return [course.courseNumber, course.courseTitle.replaceAll("&amp;", "&")];
  }));
  console.log(`Getting courses being offered in ${termName}...`);
  const coursesBeingOfferedResponse = await zagwebRegistration.getClasses({
    txt_term: termCode,
    txt_subject: "CPSC",
    pageMaxSize: "100"
  });
  const coursesBeingOffered = Object.fromEntries(coursesBeingOfferedResponse.data.map((course) => {
    return [course.courseNumber, course.courseTitle.replaceAll("&amp;", "&")];
  }));
  const result = {
    allCourses,
    coursesBeingOffered,
    term: termName
  };
  console.log("Downloading result...");
  const resultBlob = new Blob([JSON.stringify(result)], {
    type: "application/json"
  });
  const blobURL = URL.createObjectURL(resultBlob);
  const anchorElement = document.createElement("a");
  anchorElement.href = blobURL;
  anchorElement.download = "result.json";
  document.body.appendChild(anchorElement);
  anchorElement.click();
  anchorElement.remove();
  URL.revokeObjectURL(blobURL);
}
init().then(() => {
  console.log("Done!");
}).catch(console.error);
