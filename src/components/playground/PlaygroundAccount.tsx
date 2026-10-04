import type { SessionUser } from "@/lib/session";

export function PlaygroundAccount({
  user,
  locale,
  copy,
}: {
  user: SessionUser;
  locale: string;
  copy: { signedInAs: string; logout: string };
}) {
  return (
    <div className="playground-user">
      {user.picture ? (
        // eslint-disable-next-line @next/next/no-img-element -- LINE avatar host is dynamic
        <img src={user.picture} alt="" width={36} height={36} />
      ) : null}
      <p>
        <span>{copy.signedInAs}</span> {user.name}
      </p>
      <form action="/api/auth/logout" method="post">
        <input type="hidden" name="locale" value={locale} />
        <button type="submit">{copy.logout}</button>
      </form>
    </div>
  );
}
