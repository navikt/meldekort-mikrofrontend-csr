import { Alert } from "@navikt/ds-react";
import { meldekortUrl } from "../../api/urls";
import LinkCard from "../../components/card/LinkCard";
import { MeldekortData } from "../../types/MeldekortType";
import { createPendingForInnsendingText } from "./meldekortPendingText";

interface Props {
  meldekort: MeldekortData;
}

const MeldekortPending = ({ meldekort }: Props) => {
  const title = createPendingForInnsendingText(meldekort);

  return (
    <LinkCard href={meldekortUrl}>
      <Alert inline variant="info" size="small">
        {title}
      </Alert>
    </LinkCard>
  );
};

export default MeldekortPending;
