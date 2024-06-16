import useUserSettingsStoreFacade from "../../stores/useUserSettingsStore/useUserSettingsStore.facade";
import { useTheme } from "../../contexts/ThemeContext";
import { AUDIO_VOICES } from "../../constants";
import { PronunciationVoice } from "../../types/UserSettingsTypes";
import Label from "../Label";
import Card from "../Card";
import Selector, { SelectItem } from "../Selector";
import ColorThemeSwitch from "../ColorThemeSwitch";
import HelpSpan from "../HelpSpan";
import Switch from "../Switch";
import { SettingRow } from "../../styles/BaseStyledComponents";
import styled from "styled-components";

const Disclaimer = styled.div`
  font-size: 0.875rem;
  color: var(--text-color);
  p {
    margin: 0;
  }
`;

const AudioVoiceDisclaimerContents = (
  <Disclaimer>
    <p>
      Kyoto accent isn't always available for vocab, Tokyo accent of same gender
      may be used as backup
    </p>
  </Disclaimer>
);

const PitchAccentDisclaimerContents = (
  <Disclaimer>
    <p>
      Pitch accent info is not available for all vocab, info will only be
      displayed when available
    </p>
  </Disclaimer>
);

function GeneralUserSettings() {
  const {
    pronunciationVoice,
    setPronunciationVoice,
    setPrefersDarkModeTheme,
    shouldDisplayPitchAccent,
    setShouldDisplayPitchAccent,
  } = useUserSettingsStoreFacade();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const voiceID = pronunciationVoice.id;
  const isKyotoAccentSelected = pronunciationVoice.details.accent === "Kyoto";

  const updateSelectedVoice = (newVoiceID: string) => {
    const newVoice = AUDIO_VOICES.find((voice) => voice.id === newVoiceID)!;
    setPronunciationVoice(newVoice);
  };

  const setIsDarkModeOn = (isDarkMode: boolean) => {
    setPrefersDarkModeTheme(isDarkMode);
    setIsDarkMode(isDarkMode);
  };

  return (
    <Card
      title="General"
      headerBgColor="var(--ion-color-secondary)"
      headerTextColor="white"
    >
      <SettingRow>
        {isKyotoAccentSelected ? (
          <Label idOfControl="audio-voice-selector">
            <HelpSpan
              helpPopoverContents={AudioVoiceDisclaimerContents}
              punctuation="asterisk"
            >
              Audio Voice
            </HelpSpan>
          </Label>
        ) : (
          <Label labelText="Audio Voice" idOfControl="audio-voice-selector" />
        )}
        <Selector
          id="audio-voice-selector"
          value={voiceID}
          onValueChange={(updatedValue) => updateSelectedVoice(updatedValue)}
        >
          {AUDIO_VOICES.map((voiceOption: PronunciationVoice) => {
            return (
              <SelectItem
                key={`voice_${voiceOption.id}`}
                value={voiceOption.id}
              >
                {voiceOption.displayName}
              </SelectItem>
            );
          })}
        </Selector>
      </SettingRow>
      <SettingRow>
        <Label labelText="Color Theme" idOfControl="color-theme-switch" />
        <ColorThemeSwitch
          isSwitchedOn={isDarkMode}
          setIsSwitchedOn={setIsDarkModeOn}
          labelId="color-theme-switch"
        />
      </SettingRow>
      <SettingRow>
        <Label idOfControl="pitchAccentSwitch">
          <HelpSpan
            helpPopoverContents={PitchAccentDisclaimerContents}
            punctuation="asterisk"
          >
            Display Pitch Accent for Vocab
          </HelpSpan>
        </Label>
        <Switch
          isSwitchedOn={shouldDisplayPitchAccent}
          setIsSwitchedOn={setShouldDisplayPitchAccent}
          labelId="pitchAccentSwitch"
          size="medium"
          showText={true}
        />
      </SettingRow>
    </Card>
  );
}

export default GeneralUserSettings;
