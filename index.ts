import "dotenv/config";
import { ZagwebRegistration } from "./ZagwebRegistration.ts";

const cookieString = `JSESSIONID=${process.env.JSESSIONID}; X-Oracle-BMC-LBS-Route=${process.env["X-Oracle-BMC-LBS-Route"]};`;
const zagRegis = new ZagwebRegistration(cookieString);

const terms = await zagRegis.getTerms();
// Let's assume 202520 is one of the term IDs that gets returned
console.log(terms);

// Then change the mode to the appropriate term
await zagRegis.changeMode("202520", "search");


// Get all the courses that get offered by the department
const allCourses = new Set(
  (
    await zagRegis.getCourses({
      txt_term: "202520",
      txt_subject: "CPSC",
      pageMaxSize: "100",
    })
  ).data.map((course) => course.courseNumber)
);

// Get all the courses that are being offered this term
const coursesBeingOffered = new Set(
  (
    await zagRegis.getClasses({
      txt_term: "202520",
      txt_subject: "CPSC",
      pageMaxSize: "100",
    })
  ).data.map((course) => course.courseNumber)
);

console.log(coursesBeingOffered);
console.log(allCourses.difference(coursesBeingOffered));
