import WhatsAppIcon from './icons/WhatsAppIcon';

export default function WhatsAppFab() {
  return (
    <a
      href="https://wa.me/51959942669?text=Hi%20Alexander%2C%20I%20found%20your%20site%20and%20I%27d%20like%20to%20discuss%20a%20data%20project."
      className="wa-fab"
      id="wa-fab"
      target="_blank"
      rel="noopener"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
