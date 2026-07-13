import { motion } from 'framer-motion';
import { useLang } from '../context/LangContext';
import WhatsAppIcon from './icons/WhatsAppIcon';
import EmailIcon from './icons/EmailIcon';
import LinkedInIcon from './icons/LinkedInIcon';

export default function Contact({ headline, subheadline, email, whatsapp_number, whatsapp_label, linkedin, cta_label }) {
  const { t } = useLang();
  const waUrl = `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(t.waPrefill)}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const company = form.company.value.trim();
    const challenge = form.challenge.value.trim();
    const phone = '51959942669';
    const msg = encodeURIComponent(t.formWaMsg(name, company, challenge));
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-grid">
        <div className="contact-left">
          <div className="section-title">{headline}</div>
          <p>{subheadline}</p>
          <div className="contact-channels">
            <motion.a href={waUrl} target="_blank" rel="noopener" className="channel-btn channel-wa" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <WhatsAppIcon size={18} />
              {whatsapp_label}
            </motion.a>
            <motion.a href={`mailto:${email}`} className="channel-btn channel-email" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <EmailIcon size={18} />
              {email}
            </motion.a>
            <motion.a href={linkedin} target="_blank" rel="noopener" className="channel-btn channel-li" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <LinkedInIcon size={18} />
              LinkedIn
            </motion.a>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="cf-name">{t.formNameLabel}</label>
            <input id="cf-name" name="name" type="text" placeholder="María García" required />
          </div>
          <div className="form-field">
            <label htmlFor="cf-company">{t.formCompanyLabel}</label>
            <input id="cf-company" name="company" type="text" placeholder="Acme Corp" />
          </div>
          <div className="form-field">
            <label htmlFor="cf-challenge">{t.formChallengeLabel}</label>
            <textarea id="cf-challenge" name="challenge" rows="4" placeholder={t.formChallengePlaceholder} required></textarea>
          </div>
          <motion.button type="submit" className="btn" style={{ width: '100%' }} whileTap={{ scale: 0.97 }}>
            {cta_label}
          </motion.button>
          <p className="form-note">{t.whatsappNote}</p>
        </form>
      </div>
    </section>
  );
}
