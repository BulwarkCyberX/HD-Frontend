'use client';

import { Button } from '@hackersdeal/ui';
import {
  FacebookIcon,
  GoogleIcon,
  LinkedInIcon,
  MicrosoftIcon,
} from '@/components/oauth-provider-icons';

type OAuthButtonsProps = {
  nextPath?: string;
};

const providers = [
  { id: 'microsoft', label: 'Microsoft', Icon: MicrosoftIcon },
  { id: 'google', label: 'Google', Icon: GoogleIcon },
  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
] as const;

export function OAuthButtons({ nextPath = '/dashboard' }: OAuthButtonsProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-800" />
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Or continue with</p>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {providers.map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            variant="secondary"
            className="w-full justify-center gap-2"
            onClick={() => {
              window.location.href = `${apiBase}/auth/oauth/${id}?next=${encodeURIComponent(nextPath)}`;
            }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
