import { ChevronRightIcon, ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import styles from "./LinkCard.module.css";
import { ReactElement } from "react";
import { Heading } from "@navikt/ds-react";
import { IntlShape, useIntl } from "react-intl";

interface Props {
  href: string;
  warning?: boolean;
  children: ReactElement;
}

const LinkCard = ({ href, warning, children }: Props) => {
  const { formatMessage }: IntlShape = useIntl();

  return (
    <a className={styles.container} href={href}>
      <div className={styles.headerContainer}>
        <Heading size="small" level="2">
          {formatMessage({ id: "meldekort.tittel" })}
        </Heading>
        <div className={styles.chevronContainer}>
          {warning && <ExclamationmarkTriangleFillIcon className={styles.warning} aria-hidden fontSize="24px" />}
          <ChevronRightIcon className={styles.chevron} aria-hidden fontSize="24px" />
        </div>
      </div>
      <div className={styles.contentContainer}>{children}</div>
    </a>
  );
};

export default LinkCard;
