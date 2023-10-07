import { BackroadNodeManager, run } from 'backroad';
import { pages } from './pages';

run((br) => {
  br.title({ value: 'Backroad Example' });
  const sidebar = br.sidebar({});
  br.write({ body: '# Backroad - If JS could HTML' });
  br.image({ src: 'https://cdn.wallpapersafari.com/35/30/rmUW4V.png' });

  sidebar.linkGroup({
    items: [
      { href: '/inline', label: 'Inline Page Example' },
      { href: '/charts', label: 'Charts Example' },
      { href: '/select', label: 'Select Example' },
      { href: '/markdown', label: 'Markdown Example' },
      { href: '/stats', label: 'Stats Example' },
      { href: '/columns', label: 'Columns Example' },
    ],
  });

  // rendering examples on separate pages (defined in pages folder instead of inline)
  f(pages.charts, br.page({ path: '/charts' }));
  f(pages.select, br.page({ path: '/select' }));
  f(pages.markdown, br.page({ path: '/markdown' }));
  f(pages.stats, br.page({ path: '/stats' }));
  f(pages.columns, br.page({ path: '/columns' }));
});

const f = (
  pageContentFunc: (br: BackroadNodeManager<'page'>) => void,
  br: BackroadNodeManager<'page'>
) => {
  br.link({ label: 'go home', href: '/' });
  pageContentFunc(br);
};
