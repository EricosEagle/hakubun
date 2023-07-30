import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Collection,
} from "react-aria-components";
import {
  TargetAndTransition,
  useTransform,
  motion,
  animate,
  useScroll,
} from "framer-motion";
import { TabData } from "../../types/MiscTypes";
import styled from "styled-components/macro";

const TabsStyled = styled(Tabs)`
  width: fit-content;
`;

const TabContainer = styled.div`
  position: relative;
  background-color: var(--ion-color-primary);
  padding: 3px 0;
`;

const TabListStyled = styled(TabList)`
  display: flex;
  margin-left: 0.25rem;
`;

const TabStyled = styled(Tab)`
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  outline-style: none;
  color: var(--darkest-purple);
  transition-property: background-color, border-color, color, fill, stroke,
    opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  cursor: default;
  touch-action: none;

  @media (min-width: 640px) {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  &:hover {
    color: rgba(27, 15, 36, 0.8);
  }
`;

const FocusRing = styled(motion.span)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  border-radius: 9999px;
  box-shadow: 0 0 0 0 calc(2px + 0) white;
  --ring-color: var(--darkest-purple);
  --ring-offset-width: 2px;
  box-shadow: 0 0 0 0 white, 0 0 black;
`;

const Selector = styled(motion.span)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  border-radius: 9999px;
  background-color: var(--ion-color-primary);
  mix-blend-mode: difference;
`;

const TabPanels = styled.div`
  display: flex;
  overflow: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 300;
  color: white;
  scroll-snap-type: x mandatory;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const TabPanelStyled = styled(TabPanel)`
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 0.25rem;
  outline-style: none;
  width: 100%;
  scroll-snap-align: start;
  flex-shrink: 0;
`;

type Props = {
  tabs: TabData[];
};

// based off of Devon Govett's react aria framer motion example, p cool shit
function SwipeableTabs({ tabs }: Props) {
  const [selectedKey, setSelectedKey] = useState<string>(tabs[0].id);
  const tabListRef = useRef<HTMLDivElement | undefined>();
  const tabPanelsRef = useRef<HTMLDivElement | undefined>();

  // Track the scroll position of the tab panel container.
  const { scrollXProgress } = useScroll({
    container: tabPanelsRef as unknown as RefObject<HTMLElement>,
  });

  // Find all the tab elements so we can use their dimensions.
  const [tabElements, setTabElements] = useState<Element[]>([]);

  useEffect(() => {
    if (tabElements.length === 0 && tabListRef.current) {
      const tabs = tabListRef.current.querySelectorAll("[role=tab]");
      setTabElements(Array.from(tabs));
    }
  }, [tabElements]);

  // This function determines which tab should be selected
  // based on the scroll position.
  const getIndex = useCallback(
    (x: number) => Math.max(0, Math.floor((tabElements.length - 1) * x)),
    [tabElements]
  );

  // This function transforms the scroll position into the X position
  // or width of the selected tab indicator.
  const transform = (
    x: number,
    property: "offsetLeft" | "offsetWidth"
  ): number => {
    if (!tabElements.length) return 0;

    // Find the tab index for the scroll X position.
    const index = getIndex(x);

    // Get the difference between this tab and the next one.
    const difference =
      index < tabElements.length - 1
        ? tabElements[index + 1][property as keyof {}] -
          tabElements[index][property as keyof {}]
        : tabElements[index]["offsetWidth" as keyof {}];

    // Get the percentage between tabs.
    // This is the difference between the integer index and fractional one.
    const percent = (tabElements.length - 1) * x - index;

    // Linearly interpolate to calculate the position of the selection indicator.
    const value =
      tabElements[index][property as keyof {}] + difference * percent;

    // iOS scrolls weird when translateX is 0 for some reason. 🤷‍♂️
    return value || 0.1;
  };

  const x = useTransform(scrollXProgress, (x) => transform(x, "offsetLeft"));
  const width = useTransform(scrollXProgress, (x) =>
    transform(x, "offsetWidth")
  );

  // When the user scrolls, update the selected key
  // so that the correct tab panel becomes interactive.
  useEffect(() => {
    const handleChange = (x: number) => {
      if (animationRef.current || !tabElements.length) return;
      setSelectedKey(tabs[getIndex(x)].id);
    };

    const unsubscribe = scrollXProgress.onChange(handleChange);
    return () => unsubscribe();
  }, [scrollXProgress, getIndex, tabElements]);

  // When the user clicks on a tab perform an animation of
  // the scroll position to the newly selected tab panel.
  const animationRef = useRef<any>();
  const onSelectionChange = (selectedKey: React.Key) => {
    let selectedAsStr = selectedKey as string;
    setSelectedKey(selectedAsStr);

    // If the scroll position is already moving but we aren't animating
    // then the key changed as a result of a user scrolling. Ignore.
    if (scrollXProgress.getVelocity() && !animationRef.current) {
      return;
    }

    const tabPanel = tabPanelsRef.current;
    const index = tabs.findIndex((tab) => tab.id === selectedKey);
    if (animationRef.current) {
      animationRef.current.stop();
    }
    if (tabPanel) {
      animationRef.current = animate<TargetAndTransition>(
        tabPanel.scrollLeft as any,
        (tabPanel.scrollWidth * (index / tabs.length)) as any,
        {
          type: "spring",
          bounce: 0.2,
          duration: 0.6,
          onUpdate: (v) => {
            (tabPanel.scrollLeft as any) = v;
          },
          onPlay: () => {
            // Disable scroll snap while the animation is going or weird things happen.
            tabPanel.style.scrollSnapType = "none";
          },
          onComplete: () => {
            tabPanel.style.scrollSnapType = "";
            animationRef.current = null;
          },
        }
      );
    }
  };

  return (
    <TabsStyled selectedKey={selectedKey} onSelectionChange={onSelectionChange}>
      <TabContainer>
        <TabListStyled ref={tabListRef as any} items={tabs}>
          {(tab: any) => (
            <TabStyled>
              {({ isSelected, isFocusVisible }) => (
                <>
                  {tab.label}
                  {isFocusVisible && isSelected && (
                    // Focus ring.
                    <FocusRing style={{ x, width }} />
                  )}
                </>
              )}
            </TabStyled>
          )}
        </TabListStyled>
        {/* Selection indicator. */}
        <Selector style={{ x, width }} />
      </TabContainer>
      <TabPanels ref={tabPanelsRef as any}>
        <Collection items={tabs}>
          {(tab: any) => (
            <TabPanelStyled shouldForceMount>{tab.tabContents}</TabPanelStyled>
          )}
        </Collection>
      </TabPanels>
    </TabsStyled>
  );
}

export default SwipeableTabs;