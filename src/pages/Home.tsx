import { useState, useEffect } from "react";
import { IonButton, IonItem, IonSpinner } from "@ionic/react";
import { settings } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";
import { WaniKaniAPI } from "../api/WaniKaniApi";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonGrid,
  IonCol,
  IonRow,
  IonIcon,
} from "@ionic/react";

const Home = () => {
  const [reviewNum, setReviewNum] = useState("");
  const [reviewData, setReviewData] = useState([]);
  const [homeLoading, setHomeLoading] = useState(false);
  // TODO: show user level and name
  const [level, setLevel] = useState<number | undefined>();
  const [username, setUsername] = useState<string | undefined>("");

  const auth = useAuth();

  useEffect(() => {
    setHomeLoading(true);
    setUserDetails();
    setReviews();
  }, [auth]);

  const removeAuth = () => {
    (auth as any).removeAuth();
  };

  const setUserDetails = () => {
    let username = auth.auth!.username;
    setUsername(username);

    let level = auth.auth!.level;
    setLevel(level);
  };

  // TODO: change name once getting reviews and lessons
  const setReviews = () => {
    WaniKaniAPI.getReviews()
      .then((reviews: { total_count: any; data: any }) => {
        setReviewNum(`${reviews.total_count}`);
        setReviewData(reviews.data);
        // TODO: use reviewData to show radicals kanji and kanji

        // TODO: get lessons using api, maybe by chaining promises
      })
      .finally(() => {
        setHomeLoading(false);
      });
  };

  // TODO: move header into its own component
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonGrid>
            <IonRow style={styles.row}>
              <IonCol>
                <IonItem>{username}</IonItem>
                <IonItem>{level}</IonItem>
              </IonCol>
              <IonCol style={styles.rightCol}>
                <IonIcon
                  icon={settings}
                  color="secondary"
                  size="large"
                  aria-hidden="true"
                ></IonIcon>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonItem>
              <IonCol>Reviews: {reviewNum}</IonCol>
            </IonItem>
          </IonRow>
          <IonRow>
            <IonButton
              title="Remove authorization"
              onClick={() => removeAuth()}
            >
              Remove Auth
            </IonButton>
          </IonRow>
        </IonGrid>
        {homeLoading && <IonSpinner name="dots"></IonSpinner>}
      </IonContent>
    </>
  );
};

let styles = {
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: "10px",
  },
  rightCol: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
};

export default Home;
