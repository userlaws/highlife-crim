import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { activities, formatUpdated, inCity, items, methTrays, perks, rep, robberies, sources } from '@/lib/resources';

export const metadata: Metadata = {
  title: 'Resources | How to Crim',
  description: 'Crew limits, rep, equipment, perks, and meth cooking for Highlife criminal activity.',
};

const Cell = ({ value }: { value: string }) => value === inCity ? <span className="res-muted">{value}</span> : <>{value}</>;

export default function ResourcesPage() {
  return <div className="page-shell gallery-page">
    <ThemeToggle />
    <main className="gallery-content resources">
      <Link prefetch href="/" className="game-brand">How to <span>Crim</span></Link>
      <Link prefetch href="/" className="back-link">← Back to home</Link>
      <div className="gallery-heading">
        <div>
          <p className="gallery-eyebrow">CRIMINAL REFERENCE</p>
          <h1>Resources</h1>
          <p>Crew limits, rep, gear, and perks for every crime, on one page.</p>
        </div>
      </div>
      <p className="res-notice"><strong>Subject to change.</strong> Last updated {formatUpdated()}. Compiled from the public Highlife Wiki. Where the Wiki deliberately leaves something out, it says “{inCity}” here instead of a guess.</p>

      <nav className="res-toc" aria-label="On this page">
        {[['robberies', 'Robberies'], ['activities', 'Other crime'], ['items', 'Items'], ['rep', 'Rep'], ['perks', 'Perks'], ['meth', 'Meth'], ['sources', 'Sources']].map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <section id="robberies" className="res-section">
        <h2>Robberies</h2>
        <div className="score-table"><Table className="res-table">
          <TableHeader><TableRow><TableHead>Crime</TableHead><TableHead>People</TableHead><TableHead>Vehicles</TableHead><TableHead>How it works</TableHead><TableHead>Rep</TableHead><TableHead>Good to know</TableHead></TableRow></TableHeader>
          <TableBody>{robberies.map(row => <TableRow key={row.crime}>
            <TableCell><strong>{row.crime}</strong></TableCell><TableCell>{row.people}</TableCell><TableCell>{row.vehicles}</TableCell>
            <TableCell className="res-wrap"><Cell value={row.how} /></TableCell><TableCell>{row.rep}</TableCell><TableCell className="res-wrap">{row.notes}</TableCell>
          </TableRow>)}</TableBody>
        </Table></div>
      </section>

      <section id="activities" className="res-section">
        <h2>Other crime</h2>
        <div className="score-table"><Table className="res-table">
          <TableHeader><TableRow><TableHead>Activity</TableHead><TableHead>What you need</TableHead><TableHead>What matters</TableHead></TableRow></TableHeader>
          <TableBody>{activities.map(row => <TableRow key={row.name}>
            <TableCell><strong>{row.name}</strong></TableCell><TableCell className="res-wrap"><Cell value={row.needs} /></TableCell><TableCell className="res-wrap">{row.matters}</TableCell>
          </TableRow>)}</TableBody>
        </Table></div>
      </section>

      <div className="res-columns">
        <section id="items" className="res-section">
          <h2>Items</h2>
          <dl className="res-list">{items.map(item => <div key={item.name}><dt>{item.name}</dt><dd>{item.about}</dd></div>)}</dl>
        </section>
        <section id="rep" className="res-section">
          <h2>Rep</h2>
          <div className="score-table"><Table className="res-table">
            <TableHeader><TableRow><TableHead>Crime</TableHead><TableHead>Rep</TableHead></TableRow></TableHeader>
            <TableBody>{rep.map(([crime, value]) => <TableRow key={crime}><TableCell>{crime}</TableCell><TableCell><strong>{value}</strong></TableCell></TableRow>)}</TableBody>
          </Table></div>
        </section>
      </div>

      <section id="perks" className="res-section">
        <h2>Crim perks worth having</h2>
        <dl className="res-list res-grid">{perks.map(([name, about]) => <div key={name}><dt>{name}</dt><dd>{about}</dd></div>)}</dl>
      </section>

      <section id="meth" className="res-section">
        <h2>Meth cooking</h2>
        <p>You need cooking supplies, a cooking apparatus, an applicable vehicle, and PPE. Each cook gets a <strong>Cook Score from 0 to 125</strong>, based on how well you cooked and how good your recipe is. Divide the score by 33 and round down for the base tray count. The Wiki says the longer you stay on green, the more likely you are to get Cloudy. Quality affects how well it sells.</p>
        <div className="score-table"><Table className="res-table">
          <TableHeader><TableRow><TableHead>Perk</TableHead><TableHead>Divisor</TableHead><TableHead>1 tray</TableHead><TableHead>2 trays</TableHead><TableHead>3 trays</TableHead><TableHead>4 trays</TableHead></TableRow></TableHeader>
          <TableBody>{methTrays.map(row => <TableRow key={row.perk}>
            <TableCell><strong>{row.perk}</strong></TableCell><TableCell>{row.divisor}</TableCell><TableCell>{row.one}</TableCell><TableCell>{row.two}</TableCell><TableCell>{row.three}</TableCell><TableCell>{row.four}</TableCell>
          </TableRow>)}</TableBody>
        </Table></div>
        <p className="res-muted">? The Wiki's four-tray rows for Tier I and II contradict each other. The table says “not possible,” but the note below it still quotes 124 and 116 as four-tray scores. Test in-city before relying on it.</p>
        <details className="res-details">
          <summary>Recipes, and what is still unknown</summary>
          <p><strong>The recipe is a separate gate.</strong> Even if your score reaches 3 trays, you only get 3 if your recipe can make 3; otherwise you get 2. The same goes for 4. Recipe values are scrambled at random every month, and the Wiki says there is no way to calculate the perfect recipe. Finding it is trial and error.</p>
          <p><strong>Best public model:</strong> potential trays = floor(Cook Score ÷ divisor), then capped by what the recipe allows. This is reconstructed from the Wiki's numbers, not from source code; the meth script is not in Highlife's public GitHub repo.</p>
          <p><strong>Not publicly known:</strong> how the 125 points split between recipe and cooking, exactly how green time is scored, the formula for Cloudy, how quality turns into sale price, the base police alert chance, and the current recipe.</p>
          <p><strong>Community reports, unconfirmed:</strong> a tray broke down into 16–20 bags on scales (about two years ago, before the inventory overhaul). Blue and green meth were said to come only from the whitelisted warehouse lab. Neither is on the current Wiki.</p>
          <p><strong>Also useful:</strong> Plain Sight lowers the police notification chance while cooking by 10–30% depending on level. The Top Shotta group specialty grants Let Him Cook I.</p>
        </details>
        <p><Link prefetch href="/play/meth" className="res-link">Practice the cook minigame →</Link></p>
      </section>

      <section id="sources" className="res-section">
        <h2>Sources</h2>
        <p>These are the sources for everything on this page, and the reference for any update. The meth recipe formula, how recipe and cooking split the score, green-zone scoring, and the current monthly recipe are not public in any of them. The formulas above are reconstructed from the documented numbers, not taken from server code.</p>
        <div className="res-sources">{sources.map(source => <div key={source.group}>
          <h3>{source.group}</h3>
          <ul>{source.links.map(link => <li key={link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.title} ↗</a><span>{link.note}</span></li>)}</ul>
        </div>)}</div>
      </section>
    </main>
  </div>;
}
