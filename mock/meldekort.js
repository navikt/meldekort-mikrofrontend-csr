export default [
  {
    url: "/api/meldekortinfo",
    method: "get",
    response: () => {
      return {
        etterregistrerteMeldekort: 2,
        meldekortbruker: true,
        nesteInnsendingAvMeldekort: "2019-09-30",
        meldekort: 2,
        resterendeFeriedager: 2,
        nesteMeldekort: {
          fra: "2019-09-09",
          kanSendesFra: "2019-09-21",
          risikererTrekk: false,
          sisteDatoForTrekk: "2019-09-30",
          til: "2019-09-22",
          uke: "37-38",
        },
      };
    },
  },
];
