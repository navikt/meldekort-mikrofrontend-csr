import { Alert, BodyLong } from "@navikt/ds-react";
import { IntlShape, useIntl } from "react-intl";
import { etterregistreringUrl } from "../../api/urls";
import LinkCard from "../../components/card/LinkCard";
import styles from "../../components/card/LinkCard.module.css";
import { MeldekortData } from "../../types/MeldekortType";
import { createMeldekortEtterregistreringText } from "./meldekortEtterregistreringText";

interface Props {
  meldekort: MeldekortData;
}

const MeldekortEtterregistrering = ({ meldekort }: Props) => {
  const title = createMeldekortEtterregistreringText(meldekort);
  const { formatMessage }: IntlShape = useIntl();

  if (meldekort.etterregistrerteMeldekort > 0) {
    return (
      <LinkCard warning={true} href={etterregistreringUrl}>
        <>
          <BodyLong className={styles.text}>{title}</BodyLong>
          <Alert inline variant="warning" size="small">
            {formatMessage({ id: "meldekort.label.etterregistrering" }, { count: meldekort.etterregistrerteMeldekort })}
          </Alert>
        </>
      </LinkCard>
    );
  }

  return null;
};

export default MeldekortEtterregistrering;
