import { Alert, BodyLong } from "@navikt/ds-react";

import { meldekortUrl } from "../../api/urls";
import LinkCard from "../../components/card/LinkCard";
import styles from "../../components/card/LinkCard.module.css";
import { MeldekortData } from "../../types/MeldekortType";
import { createDatoLabel, createReadyForInnsendingText, createRisikererTrekkDescription } from "./meldekortReadyText";

interface Props {
  meldekort: MeldekortData;
}

const MeldekortReady = ({ meldekort }: Props) => {
  const title = createReadyForInnsendingText(meldekort);
  const dato = createDatoLabel(meldekort);
  const risikererTrekk = meldekort.nyeMeldekort?.nesteMeldekort?.risikererTrekk;
  const risikererTrekkDescription = createRisikererTrekkDescription(meldekort);

  return (
    <LinkCard href={meldekortUrl}>
      <>
        <BodyLong className={styles.text}>{title}</BodyLong>
        <Alert inline variant="info" size="small">
          {risikererTrekk ? risikererTrekkDescription : dato}
        </Alert>
      </>
    </LinkCard>
  );
};

export default MeldekortReady;
