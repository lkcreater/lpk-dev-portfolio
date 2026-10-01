export function Marquee({ text }: { text: string }) {
  return (
    <div className="marquee" aria-label={text}>
      <div>
        {[0, 1].map((copy) => (
          <span aria-hidden={copy === 1} key={copy}>
            {text}&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}
