import { useEffect, useState } from "react";

import { IonRow, IonCol, IonSkeletonText } from "@ionic/react";

import { Subject } from "../../types/Subject";

import { BasicCard } from ".././cards/BasicCard";
import { RadicalImageCard } from "../buttons/RadicalImageButton";
import { SubjectCard } from "../cards/SubjectCard";

import { useRadicalAssignmentsForLvl } from "../../hooks/useRadicalAssignmentsForLvl";
import { useRadicalSubjectsForLvl } from "../../hooks/useRadicalSubjectsForLvl";

import styles from "./RadicalForLvlCard.module.scss";

interface Props {
  level: number | undefined;
}

interface SrsLevels {
  [key: string]: any;
}

interface AvailableTimes {
  [key: string]: any;
}

export const RadicalContainer = ({ level }: Props) => {
  const [srsStages, setSrsStages] = useState<SrsLevels>({});
  const [availTimes, setAvailTimes] = useState<AvailableTimes>({});
  const [loading, setLoading] = useState(true);

  const {
    isLoading: radicalSubLvlLoading,
    data: radicalSubLvlData,
    error: radicalSubLvlErr,
  } = useRadicalSubjectsForLvl(level);

  const {
    isLoading: radicalAssignmentLvlLoading,
    data: radicalAssignmentLvlData,
    error: radicalAssignmentLvlErr,
  } = useRadicalAssignmentsForLvl(level, radicalSubLvlData);

  useEffect(() => {
    // TODO: change so if statement not needed?
    if (radicalSubLvlData) {
      let mappedSrsLvls: SrsLevels = {};
      let mappedAvailTimes: AvailableTimes = {};

      radicalSubLvlData.forEach((radical: any) => {
        const found = radicalAssignmentLvlData.find(
          ({ subject_id }: any) => subject_id === radical.id
        );

        if (found) {
          mappedAvailTimes[radical.id] = found.available_at;
          mappedSrsLvls[radical.id] = found.srs_stage;
        }
      });

      setSrsStages(mappedSrsLvls);
      setAvailTimes(mappedAvailTimes);
    }
  }, [radicalAssignmentLvlData]);

  useEffect(() => {
    if (radicalSubLvlData && radicalAssignmentLvlData) {
      setLoading(false);
    }
  }, [radicalAssignmentLvlData, radicalSubLvlData]);

  //   TODO: change to ternary where loading skeleton is displayed while no data
  return (
    <>
      {!loading && (
        <BasicCard title="Radicals" isLoading={false}>
          <IonRow class="ion-align-items-center ion-justify-content-start">
            {(radicalSubLvlData as Subject[]).map((radical: any) => {
              return (
                <IonCol
                  key={`col_${radical.id}`}
                  size="2"
                  className={`${styles.radItemContainer}`}
                >
                  {radical.useImage ? (
                    <RadicalImageCard
                      radicalObj={radical}
                      availableImages={radical.availableImages}
                      srsStage={srsStages[radical.id]}
                      availTime={availTimes[radical.id]}
                    ></RadicalImageCard>
                  ) : (
                    <SubjectCard
                      subject={radical}
                      srsStage={srsStages[radical.id]}
                      availTime={availTimes[radical.id]}
                      isRadical={true}
                    ></SubjectCard>
                  )}
                </IonCol>
              );
            })}
          </IonRow>
          {srsStages && (
            <IonRow>
              <IonCol></IonCol>
            </IonRow>
          )}
        </BasicCard>
      )}

      {loading && (
        <BasicCard title="" isLoading={true}>
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
        </BasicCard>
      )}
    </>
  );
};