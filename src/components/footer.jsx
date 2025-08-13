import React from 'react'

const Footer = () => {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = (n) => n.toString().padStart(2, '0');
  const hours = now.getHours() % 12 || 12;
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const dateTimeString = `${pad(hours)}:${minutes}:${seconds} ${ampm}`;

  return (
    <footer className="flex justify-between items-center py-4 px-4 md:px-8 border-t border-dark-100">
      <div className="hidden md:block text-xs md:text-base">
        {dateTimeString}
      </div>

      <a href="#" className="text-xs md:text-base text-amber-500 hover:underline font-medium">Terms and Services</a>

      <div className="text-xs md:text-base">
        &copy; {now.getFullYear()} John Doe
      </div>
    </footer>
  );
}

export default Footer
