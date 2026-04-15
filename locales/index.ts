const enMain = require("./en/main.json");
const enNavigate = require("./en/navigate.json");
const enOnboarding = require("./en/onboarding.json");
const enPlace = require("./en/place.json");
const enRoutePlanning = require("./en/routePlanning.json");
const enSearch = require("./en/search.json");
const enSettings = require("./en/settings.json");
const enTripHistory = require("./en/trip_history.json");
const frMain = require("./fr/main.json");
const frNavigate = require("./fr/navigate.json");
const frOnboarding = require("./fr/onboarding.json");
const frPlace = require("./fr/place.json");
const frRoutePlanning = require("./fr/routePlanning.json");
const frSearch = require("./fr/search.json");
const frSettings = require("./fr/settings.json");
const frTripHistory = require("./fr/trip_history.json");

const translations = {
  fr: {
    onboarding: frOnboarding,
    main: frMain,
    routePlanning: frRoutePlanning,
    navigate: frNavigate,
    search: frSearch,
    settings: frSettings,
    place: frPlace,
    trip_history: frTripHistory,
  },
  en: {
    onboarding: enOnboarding,
    main: enMain,
    routePlanning: enRoutePlanning,
    navigate: enNavigate,
    search: enSearch,
    settings: enSettings,
    place: enPlace,
    trip_history: enTripHistory,
  },
};

export default translations;
