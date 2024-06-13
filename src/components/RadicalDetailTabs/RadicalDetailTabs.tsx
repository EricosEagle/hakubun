import { useState } from "react";
import { IonSkeletonText } from "@ionic/react";
import { useSubjectsByIDs } from "../../hooks/subjects/useSubjectsByIDs";
import { useAssignmentsBySubjIDs } from "../../hooks/assignments/useAssignmentsBySubjIDs";
import { Radical, Subject } from "../../types/Subject";
import RadicalNameMnemonic from "../RadicalNameMnemonic";
import SubjectMeanings from "../SubjectMeanings";
import SubjectButtonList from "../SubjectButtonList";
import SvgIcon from "../SvgIcon";
import {
  SubjDetailSection,
  SubjDetailSubHeading,
  SubjDetailTabContainer,
} from "../../styles/SubjectDetailsStyled";
import { FoundInHeadingContainer } from "../../styles/BaseStyledComponents";
import MagnifyingGlassIcon from "../../images/magnifying-glass-color.svg?react";
import Tabs from "../Tabs";

type Props = {
  radical: Subject;
};

function RadicalDetailTabs({ radical }: Props) {
  const [selectedTabKey, setSelectedTabKey] = useState<string>("name");
  const hasAmalgamationSubjs = radical.amalgamation_subject_ids!.length > 0;
  const {
    isLoading: usedInKanjiSubjLoading,
    data: usedInKanjiSubjData,
    error: usedInKanjiSubjErr,
  } = useSubjectsByIDs(
    radical.amalgamation_subject_ids!,
    hasAmalgamationSubjs,
    true
  );

  const {
    isLoading: usedInKanjiAssignmentsLoading,
    data: usedInKanjiAssignmentsData,
    error: usedInKanjiAssignmentsErr,
  } = useAssignmentsBySubjIDs(
    radical.amalgamation_subject_ids!,
    hasAmalgamationSubjs
  );

  const usedInKanjiLoading =
    hasAmalgamationSubjs &&
    (usedInKanjiSubjLoading ||
      usedInKanjiSubjErr ||
      usedInKanjiAssignmentsLoading ||
      usedInKanjiAssignmentsErr);

  return (
    <Tabs
      id={`radical${radical.id}`}
      selectedTabKey={selectedTabKey}
      setSelectedTabKey={setSelectedTabKey}
      tabs={[
        {
          id: "name",
          label: "Name",
          tabContents: (
            <SubjDetailTabContainer>
              <SubjectMeanings
                subject={radical as Subject}
                showPrimaryMeaning={true}
              />
              <RadicalNameMnemonic radical={radical as Radical} />
              {usedInKanjiLoading ? (
                <IonSkeletonText animated={true}></IonSkeletonText>
              ) : (
                <SubjDetailSection>
                  <FoundInHeadingContainer>
                    <SvgIcon
                      icon={<MagnifyingGlassIcon />}
                      width="1.5em"
                      height="1.5em"
                    />
                    <SubjDetailSubHeading>Found in Kanji</SubjDetailSubHeading>
                  </FoundInHeadingContainer>
                  {hasAmalgamationSubjs && usedInKanjiSubjData ? (
                    <SubjectButtonList
                      btnSize="lg"
                      subjList={usedInKanjiSubjData}
                      assignmentList={usedInKanjiAssignmentsData ?? []}
                    />
                  ) : (
                    <p>Hmm, well this shouldn't happen..</p>
                  )}
                </SubjDetailSection>
              )}
            </SubjDetailTabContainer>
          ),
        },
      ]}
    />
  );
}

export default RadicalDetailTabs;
