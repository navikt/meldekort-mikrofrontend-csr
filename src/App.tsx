import useSWRImmutable from "swr/immutable";
import { Heading } from "@navikt/ds-react";
import { IntlShape, useIntl } from "react-intl";
import { MeldekortDataFraApi } from "./types/MeldekortType";
import { meldekortApiUrl } from "./api/urls";
import { isMeldekortbruker, meldekortState } from "./domain/meldekortState";
import { fetcher } from "./api/api";
import MeldekortEtterregistrering from "./domain/meldekort-etterregistrering/MeldekortEtterregistrering";
import MeldekortPending from "./domain/meldekort-pending/MeldekortPending";
import MeldekortReady from "./domain/meldekort-ready/MeldekortReady";
import styles from "./App.module.css";

function App() {
  const { data: meldekortFraApi, error } = useSWRImmutable<MeldekortDataFraApi>(meldekortApiUrl, fetcher);
  const { formatMessage }: IntlShape = useIntl();

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
    <section className={styles.meldekort}>
      <Heading size="medium" level="2" spacing>
        {formatMessage({ id: "meldekort.tittel" })}
      </Heading>
      <div className={styles.container}>
        <MeldekortEtterregistrering meldekort={meldekortData} />
        {isPendingForInnsending ? <MeldekortPending meldekort={meldekortData} /> : null}
        {isReadyForInnsending ? <MeldekortReady meldekort={meldekortData} /> : null}
      </div>
    </section>
  );
}

export default App;
