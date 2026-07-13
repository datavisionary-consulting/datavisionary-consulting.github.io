import { useLang } from '../context/LangContext';

export default function Footer() {
  const { t } = useLang();
  return <footer>{t.footer}</footer>;
}
