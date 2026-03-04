const fr_onboarding = require("./fr/onboarding.json");
const en_onboarding = require("./en/onboarding.json");
const fr_main = require("./fr/main.json");
const en_main = require("./en/main.json");
const fr_search = require("./fr/search.json");
const en_search = require("./en/search.json");
const fr_profile = require("./fr/profile.json");
const en_profile = require("./en/profile.json");
const fr_place = require("./fr/place.json");
const en_place = require("./en/place.json");
const fr_routePlanning = require("./fr/routePlanning.json");
const en_routePlanning = require("./en/routePlanning.json");
const fr_navigate = require("./fr/navigate.json");
const en_navigate = require("./en/navigate.json");

const translations = {
  fr: {
    onboarding: fr_onboarding,
    main: fr_main,
    routePlanning: fr_routePlanning,
    navigate: fr_navigate,
    search: fr_search,
    profile: fr_profile,
    place: fr_place,
  },
  en: {
    onboarding: en_onboarding,
    main: en_main,
    routePlanning: en_routePlanning,
    navigate: en_navigate,
    search: en_search,
    profile: en_profile,
    place: en_place,
  },
};

export default translations;
