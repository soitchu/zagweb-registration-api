interface CourseSearchData {
  id: number;
  termEffective: string;
  courseNumber: string;
  subject: string;
  subjectCode: string;
  college: string;
  collegeCode: string;
  department: string;
  departmentCode: string;
  courseTitle: string;
  durationUnit: unknown;
  numberOfUnits: unknown;
  attributes: unknown;
  gradeModes: unknown;
  ceu: unknown;
  courseScheduleTypes: unknown;
  courseLevels: unknown;
  creditHourHigh: number;
  creditHourLow: number;
  creditHourIndicator: string;
  lectureHourLow: number;
  lectureHourHigh: number;
  lectureHourIndicator: string;
  billHourLow: number;
  billHourHigh: number;
  billHourIndicator: string;
  labHourLow: unknown;
  labHourHigh: unknown;
  labHourIndicator: unknown;
  otherHourLow: unknown;
  otherHourHigh: unknown;
  otherHourIndicator: unknown;
  description: unknown;
  subjectDescription: string;
  courseDescription: string;
  division: unknown;
  termStart: string;
  termEnd: string;
  preRequisiteCheckMethodCde: string;
  anySections: unknown;
}

interface SearchResultsConfig {
  config: string;
  display: string;
  title: string;
  required: boolean;
  width: string;
}

interface CourseSearchResponse {
  success: boolean;
  totalCount: number;
  data: CourseSearchData[];
  pageOffset: number;
  pageMaxSize: number;
  coursesFetchedCount: number;
  pathMode: string;
  courseSearchResultsConfigs: SearchResultsConfig[];
  displaySettings: {
    enrollmentDisplay: string;
    waitlistDisplay: string;
    crossListDisplay: string;
  };
  isPlanByCrnSetForTerm: boolean;
}

interface ClassSearchData {
  id: number;
  term: string;
  termDesc: string;
  courseReferenceNumber: string;
  partOfTerm: string;
  courseNumber: string;
  subject: string;
  subjectDescription: string;
  sequenceNumber: string;
  campusDescription: string;
  scheduleTypeDescription: string;
  courseTitle: string;
  creditHours: unknown;
  maximumEnrollment: number;
  enrollment: number;
  seatsAvailable: number;
  waitCapacity: number;
  waitCount: number;
  waitAvailable: number;
  crossList: unknown;
  crossListCapacity: unknown;
  crossListCount: unknown;
  crossListAvailable: unknown;
  creditHourHigh: unknown;
  creditHourLow: number;
  creditHourIndicator: unknown;
  openSection: boolean;
  linkIdentifier: unknown;
  isSectionLinked: boolean;
  subjectCourse: string;
  faculty: {
    bannerId: string;
    category: unknown;
    class: string;
    courseReferenceNumber: string;
    displayName: string;
    emailAddress: string;
    primaryIndicator: boolean;
    term: string;
  }[];
  meetingsFaculty: {
    category: string;
    class: string;
    courseReferenceNumber: string;
    faculty: unknown[];
    meetingTime: {
      beginTime: string;
      building: string;
      buildingDescription: string;
      campus: string;
      campusDescription: string;
      category: string;
      class: string;
      courseReferenceNumber: string;
      creditHourSession: number;
      endDate: string;
      endTime: string;
      friday: boolean;
      hoursWeek: number;
      meetingScheduleType: string;
      meetingType: string;
      meetingTypeDescription: string;
      monday: boolean;
      room: string;
      saturday: boolean;
      startDate: string;
      sunday: boolean;
      term: string;
      thursday: boolean;
      tuesday: boolean;
      wednesday: boolean;
    };
    term: string;
  }[];
  status: {
    select: boolean;
    sectionOpen: boolean;
    timeConflict: boolean;
    restricted: boolean;
    sectionStatus: boolean;
    authorizationRequired: boolean;
    authorizationReason: unknown;
  };
  reservedSeatSummary: unknown;
  sectionAttributes: {
    class: string;
    code: string;
    courseReferenceNumber: string;
    description: string;
    isZTCAttribute: boolean;
    termCode: string;
  }[];
  instructionalMethod: string;
  instructionalMethodDescription: string;
}

interface ClassSearchResponse {
  success: boolean;
  totalCount: number;
  data: ClassSearchData[];
  pageOffset: number;
  pageMaxSize: number;
  sectionsFetchedCount: 26;
  pathMode: string;
  searchResultsConfigs: SearchResultsConfig[];
  displaySettings: {
    enrollmentDisplay: string;
    waitlistDisplay: string;
    crossListDisplay: string;
  };
  ztcEncodedImage: string;
}

type TermsResponse = {
  code: string;
  description: string;
}[];

interface CourseSearchParams {
  // Term
  txt_term?: string;

  // One of the items returned from getSearchParams("subject")
  txt_subject?: string;

  // One of the items returned from getSearchParams("attribute")
  txt_attribute?: string;

  // Course number
  txt_courseNumber?: string;

  // keyword search
  txt_keywordlike?: string;

  // Course number range
  txt_course_number_range_From?: string;
  txt_course_number_range_To?: string;

  // Course credit range
  txt_credithourlow?: string;
  txt_credithourhigh?: string;

  pageOffset?: string;
  pageMaxSize?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

interface ClassSearchParams {
  txt_subject: string;
  txt_term: string;
  pageOffset?: string;
  pageMaxSize?: string;

}
