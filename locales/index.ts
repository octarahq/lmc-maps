const fr_onboarding = require("./fr/onboarding.json");
const en_onboarding = require("./en/onboarding.json");
const fr_main = require("./fr/main.json");
const en_main = require("./en/main.json");

const translations = {
  fr: { onboarding: fr_onboarding, main: fr_main },
  en: { onboarding: en_onboarding, main: en_main },
};

export default translations;
