"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import { MagneticButton } from "@/components/motion/MagneticButton";

export function ContactModal({ copy }: { copy: Dictionary["contact"] }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <MagneticButton onClick={() => dialog.current?.showModal()}>{copy.cta}</MagneticButton>
      <dialog
        ref={dialog}
        className="resume-gate contact-gate"
        aria-labelledby="contact-modal-title"
        aria-describedby="contact-modal-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <form method="dialog">
          <p className="resume-gate-kicker">{copy.modalKicker}</p>
          <h3 id="contact-modal-title">{copy.modalTitle}</h3>
          <p id="contact-modal-description">{copy.modalDescription}</p>
          <div className="contact-gate-qr">
            <Image
              src="/images/qrcode/L_gainfriends_2dbarcodes_GW.png"
              alt={copy.qrAlt}
              width={540}
              height={540}
              sizes="(max-width: 599px) 72vw, 320px"
            />
          </div>
          <div className="resume-gate-actions">
            <button type="submit">{copy.modalClose}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
