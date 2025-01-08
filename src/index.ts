import { ZagwebRegistration } from "./ZagwebRegistration.ts";

async function init() {
  // No need to provide the cookie string since we're assuming the user is already logged in
  const zagwebRegistration = new ZagwebRegistration("");
  console.log("Getting terms...");
  // Get a list of terms
  const terms = await zagwebRegistration.getTerms();

  // Prompt the user to select a term
  const promptText = terms
    .map((term, index) => `${index + 1}. ${term.description}`)
    .join("\n");
  let promptResult = prompt(promptText);

  while (promptResult === null) {
    promptResult = prompt(promptText);
  }

  const termIndex = parseInt(promptResult) - 1;
  const selectedTerm = terms[termIndex];

  // The term code of the selected term
  const termCode = selectedTerm.code;
  const termName = selectedTerm.description;

  console.log("Changing mode to search...");

  // Change mode
  await zagwebRegistration.changeMode(termCode, "search");

  console.log("Getting all courses...");

  // Get all the courses that get offered by the department
  const allCoursesResponse = await zagwebRegistration.getCourses({
    txt_term: termCode,
    txt_subject: "CPSC",
    pageMaxSize: "100",
  });

  const allCourses = Object.fromEntries(
    allCoursesResponse.data.map((course) => {
      return [course.courseNumber, course.courseTitle.replaceAll("&amp;", "&")];
    })
  );

  console.log(`Getting courses being offered in ${termName}...`);

  // Get all the courses that are being offered this term
  const coursesBeingOfferedResponse = await zagwebRegistration.getClasses({
    txt_term: termCode,
    txt_subject: "CPSC",
    pageMaxSize: "100",
  });

  const coursesBeingOffered = Object.fromEntries(
    coursesBeingOfferedResponse.data.map((course) => {
      return [course.courseNumber, course.courseTitle.replaceAll("&amp;", "&")];
    })
  );

  const result = {
    allCourses,
    coursesBeingOffered,
    term: termName,
  };

  console.log("Downloading result...");

  const resultBlob = new Blob([JSON.stringify(result)], {
    type: "application/json",
  });
  const blobURL = URL.createObjectURL(resultBlob);

  // Create an anchor element to download the file
  const anchorElement = document.createElement("a");
  anchorElement.href = blobURL;
  anchorElement.download = "result.json";

  // Append the anchor element to the body and click it to download the file
  document.body.appendChild(anchorElement);
  anchorElement.click();

  // Clean up
  anchorElement.remove();
  URL.revokeObjectURL(blobURL);
}

init().then(() => {
  console.log("Done!"); 
}).catch(console.error);
