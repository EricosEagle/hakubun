import { useState } from "react";
import { useLocation, useOutlet } from "react-router";
import { AnimatePresence, motion, useWillChange } from "framer-motion";
import useAssignmentQueueStoreFacade from "../../stores/useAssignmentQueueStore/useAssignmentQueueStore.facade";
import FloatingTabBar from "../FloatingTabBar";
import styled from "styled-components";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const PageContainer = styled(motion.div)`
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
  position: relative;
  background-size: cover;
  background-color: var(--background-color);
  overflow-y: auto;
`;

const AnimatedOutlet: React.FC = () => {
  const o = useOutlet();
  const [outlet] = useState(o);

  return <>{outlet}</>;
};

function RootContainer() {
  const routerLocation = useLocation();
  const { sessionInProgress: isSessionInProgress } =
    useAssignmentQueueStoreFacade();
  const willChange = useWillChange();

  const pgsToShowTabBar = ["/", "/search", "/subjects"];
  const subjectDetailsPgRegex = /\/subjects\/\d+/;

  const shouldShow =
    pgsToShowTabBar.includes(routerLocation.pathname) ||
    (!isSessionInProgress &&
      subjectDetailsPgRegex.test(routerLocation.pathname));

  return (
    <>
      <AnimatePresence mode="popLayout">
        <PageContainer
          key={routerLocation.key}
          initial="initial"
          animate="in"
          exit="out"
          variants={containerVariants}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ willChange }}
        >
          <AnimatedOutlet />
        </PageContainer>
      </AnimatePresence>
      <AnimatePresence>{shouldShow && <FloatingTabBar />}</AnimatePresence>
    </>
  );
}

export default RootContainer;
