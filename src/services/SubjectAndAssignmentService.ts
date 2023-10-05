import {
  ReadingType,
  Subject,
  SubjectReading,
  SubjectType,
} from "../types/Subject";
import { Assignment, AssignmentType } from "../types/Assignment";
import { SrsLevelName, StudyMaterial, TagType } from "../types/MiscTypes";
import { AssignmentQueueItem, ReviewType } from "../types/AssignmentQueueTypes";
import { SortOrder } from "../components/SortOrderOption/SortOrderOption.types";
import { findStudyMaterialWithSubjID } from "./MiscService";

export const getAssignmentStatuses = (assignments: Assignment[]) => {
  return Object.values(assignments).reduce(
    (acc, item) => {
      acc.passed += item.passed_at !== null ? 1 : 0;
      acc.total += 1;
      return acc;
    },
    { passed: 0, total: 0 }
  );
};

export const getSubjectDisplayName = (subj: Subject) => {
  let primary = subj["meanings"]?.filter(
    (meaning: any) => meaning.primary === true
  );

  return primary ? primary[0].meaning : "";
};

export const getAlternativeMeanings = (subj: Subject) => {
  return subj["meanings"]?.filter((meaning: any) => meaning.primary === false);
};

export const getPrimaryReading = (readings: SubjectReading[]) => {
  let primaryReading = readings.filter(
    (reading: any) => reading.primary === true
  );
  return primaryReading[0].reading;
};

export const getKanjiReadings = (
  readings: SubjectReading[],
  readingType: ReadingType
) => {
  let readingsOfType = readings.filter(
    (reading: any) => reading.type === readingType
  );
  readingsOfType = readingsOfType.sort((a, b) => (a.primary === true ? 1 : -1));
  return readingsOfType;
};

export const getVocabReadings = (readings: SubjectReading[]) => {
  return readings.sort((a, b) => (a.primary === true ? 1 : -1));
};

export const isAssignmentLocked = (
  assignmentsData: Assignment[],
  subject: Subject
) => {
  return findAssignmentWithSubjID(assignmentsData, subject) === undefined;
};

export const findAssignmentWithSubjID = (
  assignmentsData: Assignment[],
  subject: Subject
) => {
  return assignmentsData.find(
    (assignment: Assignment) => assignment.subject_id === subject.id
  );
};

export const findSubjectForAssignment = (
  subjects: Subject[],
  assignment: Assignment
) => {
  return subjects.find(
    (subject: Subject) => subject.id === assignment.subject_id
  );
};

export const filterAssignmentsByType = (
  assignments: Assignment[],
  assignmentTypes: AssignmentType[]
) => {
  let filteredAssignments = assignments.filter(function (assignment) {
    return assignmentTypes.indexOf(assignment.subject_type) !== -1;
  });
  console.log(
    "🚀 ~ file: SubjectAndAssignmentService.tsx:86 ~ filteredAssignments ~ filteredAssignments:",
    filteredAssignments
  );

  return filteredAssignments;
};

/**
 * @description Determines whether an array of assignments contains a certain assignment type
 * @param {Assignment[]} assignmentsData array of assignments to search through
 * @param {AssignmentType} assignmentType  type of assignment to look for
 * @returns {boolean} whether or not assignment type is in queue
 */
export const checkIfAssignmentTypeInQueue = (
  assignmentsData: Assignment[],
  assignmentType: AssignmentType
) => {
  return assignmentsData.some(
    (assignment: Assignment) => assignment.subject_type === assignmentType
  );
};

const assignmentTypeText: { [index: string]: {} } = {
  radical: { singular: "Radical", plural: "Radicals" },
  kanji: { singular: "Kanji", plural: "Kanji" },
  vocabulary: { singular: "Vocabulary", plural: "Vocabulary" },
  kana_vocabulary: { singular: "Kana Vocabulary", plural: "Kana Vocabulary" },
};

export const getSubjectTypeDisplayText = (
  assignmentType: SubjectType,
  plural: boolean
) => {
  let assignmentTypeObj = assignmentTypeText[assignmentType as keyof {}];
  let displayText = plural
    ? assignmentTypeObj["plural" as keyof {}]
    : assignmentTypeObj["singular" as keyof {}];
  return displayText;
};

// TODO: change kana vocab to some other color?
const subjColors: { [index: string]: string } = {
  radical: "var(--wanikani-radical)",
  kanji: "var(--wanikani-kanji)",
  vocabulary: "var(--wanikani-vocab)",
  kana_vocabulary: "var(--wanikani-vocab)",
};

const tagColors: { [index: string]: string } = {
  reading: "var(--wanikani-reading)",
  meaning: "var(--deep-purple-accent)",
};

const subjAndTagColors = { ...subjColors, ...tagColors };

export const getSubjectColor = (subjType: SubjectType) => {
  return subjColors[subjType as keyof {}];
};

export const getTagColor = (tagType: TagType) => {
  return subjAndTagColors[tagType as keyof {}];
};

const srsLevelColors: { [index: string]: string } = {
  locked: `var(--light-greyish-purple)`,
  initiate: `var(--ion-color-primary)`,
  apprentice: `var(--wanikani-apprentice)`,
  guru: `var(--wanikani-guru)`,
  master: `var(--wanikani-master)`,
  enlightened: `var(--wanikani-enlightened)`,
  burned: `var(--wanikani-burned)`,
};

export const getSrsLevelColor = (srsLevel: SrsLevelName) => {
  return srsLevelColors[srsLevel as keyof {}];
};

export const getSubjIDsFromAssignments = (assignments: Assignment[]) => {
  return assignments.map((assignment) => assignment.subject_id);
};

// TODO: delete and just use sort function below?
export const compareAssignmentsByAvailableDate = (
  assignment1: Assignment,
  assignment2: Assignment
) => {
  if (assignment1.available_at === null) return -1;
  if (assignment2.available_at === null) return 1;

  // older sorted before newer
  return (
    new Date(assignment1.available_at).getTime() -
    new Date(assignment2.available_at).getTime()
  );
};

export const createAssignmentQueueItems = (
  assignments: Assignment[],
  subjects: Subject[],
  studyMaterials: StudyMaterial[]
): AssignmentQueueItem[] => {
  const subjectsWithQueueProps = (subjects as AssignmentQueueItem[]).map(
    (subject, index) => {
      let foundAssignment = findAssignmentWithSubjID(assignments, subject);
      let foundStudyMaterial = findStudyMaterialWithSubjID(
        studyMaterials,
        subject
      );

      // this should always be true since we retrieved the subjects based on the assignments
      let assignment = foundAssignment!;

      return {
        ...subject,
        assignment_id: assignment.id,
        srs_stage: assignment.srs_stage,
        is_reviewed: false,
        itemID: `meaning${index}`,
        meaning_synonyms: foundStudyMaterial
          ? foundStudyMaterial.meaning_synonyms
          : [],
        review_type: "meaning" as ReviewType,
        is_correct_answer: null,
        ending_srs_stage: null,
        incorrect_meaning_answers: 0,
        incorrect_reading_answers: 0,
      };
    }
  );
  // adds reading items to queue if the subject has readings (radicals and kana vocab don't)
  const itemsWithReadings = subjectsWithQueueProps.filter(
    (queueItem) => queueItem.readings !== undefined
  );

  const meaningAndReadingQueue = [
    ...subjectsWithQueueProps,
    ...itemsWithReadings.map((itemWithReadings, index) => ({
      ...itemWithReadings,
      review_type: "reading" as ReviewType,
      itemID: `reading${index}`,
    })),
  ];

  return meaningAndReadingQueue;
};

export const sortAssignmentsByAvailableDate = (
  assignments: Assignment[],
  sortOrder: SortOrder
): Assignment[] => {
  const assignmentsCopyToSort = [...assignments];
  return assignmentsCopyToSort.sort((a: Assignment, b: Assignment) => {
    if (a.available_at === null) {
      return sortOrder === "asc" ? 1 : -1;
    } else if (b.available_at === null) {
      return sortOrder === "asc" ? -1 : 1;
    }
    return sortOrder === "asc"
      ? new Date(a.available_at).getTime() - new Date(b.available_at).getTime()
      : new Date(b.available_at).getTime() - new Date(a.available_at).getTime();
  });
};

export const sortAssignmentsByLevel = (
  assignments: Assignment[],
  sortOrder: SortOrder,
  subjects: Subject[]
): Assignment[] => {
  // *testing
  console.log(
    "🚀 ~ file: SubjectAndAssignmentService.ts:261 ~ subjects:",
    subjects
  );
  // *testing
  const assignmentsCopyToSort = [...assignments];
  return assignmentsCopyToSort.sort((a: Assignment, b: Assignment) => {
    let subjectInfoA = findSubjectForAssignment(subjects, a);
    let subjectInfoB = findSubjectForAssignment(subjects, b);
    if (subjectInfoA === undefined) {
      return sortOrder === "asc" ? 1 : -1;
    }
    if (subjectInfoB === undefined) {
      return sortOrder === "asc" ? -1 : 1;
    }

    return sortOrder === "asc"
      ? subjectInfoA.level - subjectInfoB.level
      : subjectInfoB.level - subjectInfoA.level;
  });
};

export const sortAssignmentsBySrsStage = (
  assignments: Assignment[],
  sortOrder: SortOrder
): Assignment[] => {
  const assignmentsCopyToSort = [...assignments];
  return assignmentsCopyToSort.sort((a: Assignment, b: Assignment) => {
    return sortOrder === "asc"
      ? a.srs_stage - b.srs_stage
      : b.srs_stage - a.srs_stage;
  });
};
