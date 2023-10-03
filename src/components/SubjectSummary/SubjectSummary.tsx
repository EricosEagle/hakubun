import { IonRow, IonSkeletonText } from "@ionic/react";
import { useAssignmentBySubjID } from "../../hooks/useAssignmentBySubjID";
import { Assignment } from "../../types/Assignment";
import { Subject, Kanji, Vocabulary } from "../../types/Subject";
import AssignmentSrs from "./AssignmentSrs";
import PartsOfSpeech from "../PartsOfSpeech";
import SubjectMeanings from "../SubjectMeanings/SubjectMeanings";
import SubjDetailsKanjiReadings from "./SubjDetailsKanjiReadings";
import VocabReadings from "../VocabReadings/VocabReadings";
import { SubjSummaryRow } from "../../styles/SubjectDetailsStyled";
import styled from "styled-components";

const SummaryContainer = styled(IonRow)`
  display: flex;

  background-color: var(--dark-greyish-purple);
  position: relative;

  padding-inline-start: var(--ion-padding, 16px);
  padding-inline-end: var(--ion-padding, 16px);
  padding-top: var(--ion-padding, 0);
  padding-bottom: var(--ion-padding, 5px);
  margin-bottom: 10px;

  h3:first-of-type {
    margin-top: 5px;
  }
`;

const SpaceBetweenRow = styled(SubjSummaryRow)`
  justify-content: space-between;
  align-items: flex-end;
`;

type StagesRowProps = {
  justify: string;
};

const StagesRow = styled(SubjSummaryRow)<StagesRowProps>`
  gap: 10px;
  justify-content: ${({ justify }) => justify};
`;

const ReadingAndSrsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  gap: 10px;
`;

const RadicalSrsContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  margin-top: 10px;
`;

type SubjSummaryProps = {
  subject: Subject;
  assignment: Assignment | undefined;
};

// TODO: put these in same row
const RadicalSummary = ({ subject, assignment }: SubjSummaryProps) => {
  return (
    <>
      <SubjectMeanings subject={subject} showPrimaryMeaning={false} />
      <RadicalSrsContainer>
        <AssignmentSrs assignment={assignment} />
      </RadicalSrsContainer>
    </>
  );
};

const SrsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  margin-top: 5px;
`;

const KanjiReadingContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const KanjiGrid = styled(ReadingAndSrsGrid)`
  align-items: center;
`;

const KanjiSummary = ({ subject, assignment }: SubjSummaryProps) => {
  return (
    <>
      <SubjSummaryRow>
        <SubjectMeanings subject={subject} showPrimaryMeaning={false} />
      </SubjSummaryRow>
      <KanjiGrid>
        <KanjiReadingContainer>
          <SubjDetailsKanjiReadings kanji={subject as Kanji} />
        </KanjiReadingContainer>
        <SrsContainer>
          <AssignmentSrs assignment={assignment} />
        </SrsContainer>
      </KanjiGrid>
    </>
  );
};

const VocabGrid = styled(ReadingAndSrsGrid)`
  align-items: flex-start;
`;

const PartsOfSpeechContainer = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const VocabSummary = ({ subject, assignment }: SubjSummaryProps) => {
  const isKanaVocab = subject.object === "kana_vocabulary";

  return (
    <>
      <SubjSummaryRow>
        <SubjectMeanings subject={subject} showPrimaryMeaning={false} />
      </SubjSummaryRow>
      {isKanaVocab ? (
        <SpaceBetweenRow>
          <div>
            <PartsOfSpeech vocab={subject as Vocabulary} />
          </div>
          <StagesRow justify="flex-start">
            <AssignmentSrs assignment={assignment} />
          </StagesRow>
        </SpaceBetweenRow>
      ) : (
        <>
          <PartsOfSpeechContainer>
            <PartsOfSpeech vocab={subject as Vocabulary} />
          </PartsOfSpeechContainer>
          <VocabGrid>
            <VocabReadings vocab={subject as Vocabulary} />
            <SrsContainer>
              <AssignmentSrs assignment={assignment} />
            </SrsContainer>
          </VocabGrid>
        </>
      )}
    </>
  );
};

type Props = {
  subject: Subject;
};

function SubjectSummary({ subject }: Props) {
  const {
    isLoading: assignmentLoading,
    data: assignment,
    error: assignmentErr,
  } = useAssignmentBySubjID([subject.id]);

  if (assignmentLoading || assignmentErr) {
    return (
      <>
        <IonRow>
          <IonSkeletonText
            animated={true}
            style={{ height: "50px" }}
          ></IonSkeletonText>
        </IonRow>
        <IonRow>
          <IonSkeletonText
            animated={true}
            style={{ height: "50px" }}
          ></IonSkeletonText>
        </IonRow>
      </>
    );
  }

  return (
    <SummaryContainer>
      {subject.object == "radical" && (
        <RadicalSummary subject={subject} assignment={assignment} />
      )}
      {subject.object === "kanji" && (
        <KanjiSummary subject={subject} assignment={assignment} />
      )}
      {(subject.object === "vocabulary" ||
        subject.object === "kana_vocabulary") && (
        <VocabSummary subject={subject} assignment={assignment} />
      )}
    </SummaryContainer>
  );
}

export default SubjectSummary;
