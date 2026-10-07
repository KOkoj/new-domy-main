export default function PageIntro({ eyebrow, title, children }) {
  return (
    <header className="mx-auto w-full max-w-[1800px] px-5 pb-2 pt-32 sm:px-8 sm:pt-36 xl:px-[10rem]">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold tracking-wide text-[#c78b5a]">{eyebrow}</p>
      ) : null}
      <h1 className="max-w-4xl text-pretty text-[2.05rem] font-bold leading-[1.15] text-gray-900">{title}</h1>
      {children ? (
        <div className="mt-4 max-w-3xl text-pretty text-lg leading-snug text-gray-700">{children}</div>
      ) : null}
    </header>
  )
}
