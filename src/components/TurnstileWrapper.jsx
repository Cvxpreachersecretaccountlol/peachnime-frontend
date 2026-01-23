import { Turnstile } from '@marsidev/react-turnstile';

const TurnstileWrapper = ({ onVerify }) => {
  return (
    <div className="flex justify-center my-4">
      <Turnstile
        siteKey="0x4AAAAAACObFKAc1QZeQEwx"
        onSuccess={(token) => onVerify(token)}
        theme="dark"
        size="normal"
      />
    </div>
  );
};

export default TurnstileWrapper;
