import test from "node:test";
import assert from "node:assert/strict";

import { getLegalLinks, getNavCopy, getProjects } from "./content.ts";
import { de } from "./dictionaries/de.ts";

test("getProjects: Power Shop Onlineshop steht an erster Stelle, der Film vorneweg", () => {
  const [first] = getProjects(de);
  assert.equal(first.id, "powershop-onlineshop");
  assert.equal(first.gallery.length, 7);
  const { type, url, poster } = first.gallery[0];
  assert.deepEqual(
    { type, url, poster },
    {
      type: "video",
      url: "/vorschaubilder/powershop-onlineshop-loop.mp4",
      poster: "/vorschaubilder/powershop-onlineshop1.webp",
    },
  );
});

test("getProjects: Galerie-Titel paaren sich mit den Aufnahmen in Reihenfolge", () => {
  const wintersport = getProjects(de).find((p) => p.id === "wintersport-verleih");
  assert.ok(wintersport);
  assert.deepEqual(
    wintersport.gallery.slice(0, 2).map(({ url, title }) => ({ url, title })),
    [
      { url: "/vorschaubilder/gemo-app1.webp", title: "Verleihtyp wählen" },
      { url: "/vorschaubilder/gemo-app2.webp", title: "Kundendaten erfassen" },
    ],
  );
});

test("getProjects wirft, wenn die Anzahl der Galerie-Titel nicht passt", () => {
  const broken = structuredClone(de);
  broken.work.projects["wedding-app"].galleryTitles.pop();
  assert.throws(() => getProjects(broken), /wedding-app/);
});

test("getLegalLinks: feste Reihenfolge, Pfade in der Sprache der Seite", () => {
  assert.deepEqual(getLegalLinks(de, "de"), [
    { slug: "agb", href: "/agb", label: "AGB" },
    { slug: "datenschutz", href: "/datenschutz", label: "Datenschutz" },
    { slug: "impressum", href: "/impressum", label: "Impressum" },
  ]);
  assert.deepEqual(
    getLegalLinks(de, "en").map((link) => link.href),
    ["/en/agb", "/en/datenschutz", "/en/impressum"],
  );
});

test("getNavCopy: Menüeinträge in der Reihenfolge der Section-Anker", () => {
  assert.deepEqual(getNavCopy(de).items, [
    { label: "Leistungen", href: "#services" },
    { label: "Prozess", href: "#process" },
    { label: "Projekte", href: "#work" },
    { label: "Über mich", href: "#about" },
    { label: "Kontakt", href: "#contact" },
  ]);
});
