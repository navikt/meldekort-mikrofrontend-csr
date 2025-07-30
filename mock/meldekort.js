export default [
  {
    url: "/proxy",
    method: "get",
    response: () => {
      return {
        antallGjenstaaendeFeriedager: 0,
        etterregistrerteMeldekort: 2,
        meldekort: 2,
        nesteInnsendingAvMeldekort: "2019-09-30",
        nesteMeldekort: {
          fra: "2019-09-09",
          kanSendesFra: "2019-09-21",
          til: "2024-09-22",
          uke: "37-38",
        },
      };
    },
  },
];
