import useSWRImmutable from "swr/immutable";
import styles from "./App.module.css";
import { fetcher } from "./api/api";
import { meldekortApiUrl } from "./api/urls";
import MeldekortEtterregistrering from "./domain/meldekort-etterregistrering/MeldekortEtterregistrering";
import MeldekortPending from "./domain/meldekort-pending/MeldekortPending";
import MeldekortReady from "./domain/meldekort-ready/MeldekortReady";
import { isMeldekortbruker, meldekortState } from "./domain/meldekortState";
import { MeldekortDataFraApi } from "./types/MeldekortType";

function App() {
  const { data: meldekortFraApi, error } = useSWRImmutable<MeldekortDataFraApi>(meldekortApiUrl, fetcher);

  if (!meldekortFraApi) {
    return null;
  }

  if (error) {
    throw Error("Klarte ikke å hente meldekortdata");
  }

  if (!isMeldekortbruker(meldekortFraApi)) {
    return null;
  }

  const { isPendingForInnsending, isReadyForInnsending, meldekortData } = meldekortState(meldekortFraApi);

  return (
    <div className={styles.container}>
      <MeldekortEtterregistrering meldekort={meldekortData} />
      {isPendingForInnsending ? <MeldekortPending meldekort={meldekortData} /> : null}
      {isReadyForInnsending ? <MeldekortReady meldekort={meldekortData} /> : null}
    </div>
  );
}

export default App;
