import { BodyLong } from "@navikt/ds-react";
import { meldekortUrl } from "../../api/urls";
import LinkCard from "../../components/card/LinkCard";
import styles from "../../components/card/LinkCard.module.css";
import { MeldekortData } from "../../types/MeldekortType";
import { createPendingForInnsendingText } from "./meldekortPendingText";

interface Props {
  meldekort: MeldekortData;
}

const MeldekortPending = ({ meldekort }: Props) => {
  const title = createPendingForInnsendingText(meldekort);

  return (
    <LinkCard href={meldekortUrl}>
      <BodyLong className={styles.text}>{title}</BodyLong>
    </LinkCard>
  );
};

export default MeldekortPending;
