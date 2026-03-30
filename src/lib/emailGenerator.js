const ERMES_LOGO =
  'https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2164751305/settings_images/a873d5-a7a4-e2ba-0222-2a6224428c21_2946885f-ffea-485a-9de3-55c9ebec76f1.png';

// ── Block renderers — all styles inline, table-based layout ──────────────────

function renderLogo(b) {
  const align = b.align || 'center';
  const width = b.width || 150;
  return (
    '<tr><td align="' + align + '" style="padding:20px 30px;background:#ffffff;">' +
    '<img src="' + (b.url || ERMES_LOGO) + '" alt="Logo" width="' + width + '"' +
    ' style="display:block;border:0;max-width:' + width + 'px;width:100%;">' +
    '</td></tr>'
  );
}

function renderImage(b) {
  const is50 = b.width === '50%';
  const imgStyle = 'display:block;border:0;' + (is50 ? 'max-width:300px;width:50%;' : 'width:100%;');
  const img = '<img src="' + (b.url || '') + '" alt="' + (b.alt || '') + '" style="' + imgStyle + '">';
  const inner = b.link
    ? '<a href="' + b.link + '" style="border:0;display:block;">' + img + '</a>'
    : img;
  return '<tr><td align="center" style="padding:0;background:#ffffff;">' + inner + '</td></tr>';
}

function renderText(b) {
  const sizes = { small: '14px', normal: '16px', large: '20px', heading: '28px' };
  const size  = sizes[b.size] || '16px';
  const align = b.align || 'left';
  const bg    = b.bg === 'black' ? '#000000' : b.bg === 'beige' ? '#f6f3ef' : '#ffffff';
  const color = b.bg === 'black' ? '#ffffff' : '#333333';
  const fw    = b.size === 'heading' ? 'bold' : 'normal';
  const body  = (b.content || '').replace(/\n/g, '<br>');
  return (
    '<tr><td style="padding:20px 30px;background:' + bg + ';' +
    'font-family:Arial,Helvetica,sans-serif;font-size:' + size + ';font-weight:' + fw + ';' +
    'color:' + color + ';text-align:' + align + ';line-height:1.6;">' +
    body +
    '</td></tr>'
  );
}

function renderButton(b) {
  const align  = b.align || 'center';
  const bg     = b.style === 'white' ? '#ffffff' : '#000000';
  const color  = b.style === 'white' ? '#000000' : '#ffffff';
  const border = b.style === 'white' ? '2px solid #000000' : 'none';
  return (
    '<tr><td align="' + align + '" style="padding:20px 30px;background:#ffffff;">' +
    '<a href="' + (b.url || '#') + '"' +
    ' style="display:inline-block;padding:14px 32px;background:' + bg + ';color:' + color + ';' +
    'font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;' +
    'text-decoration:none;border-radius:4px;border:' + border + ';">' +
    (b.text || 'Click here') +
    '</a></td></tr>'
  );
}

function renderDivider(b) {
  const color = b.color === 'black' ? '#000000' : '#e0e0e0';
  return (
    '<tr><td style="padding:10px 30px;background:#ffffff;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    '<td style="height:1px;background:' + color + ';font-size:0;line-height:0;">&nbsp;</td>' +
    '</tr></table></td></tr>'
  );
}

function renderSpacer(b) {
  const h = b.height || 24;
  return '<tr><td style="height:' + h + 'px;font-size:0;line-height:0;background:#ffffff;">&nbsp;</td></tr>';
}

function renderColumns(b) {
  const img =
    '<td width="50%" style="padding:0;vertical-align:top;">' +
    '<img src="' + (b.imgUrl || '') + '" alt="' + (b.imgAlt || '') + '"' +
    ' style="display:block;width:100%;border:0;"></td>';
  const txt =
    '<td width="50%" style="padding:20px;vertical-align:middle;' +
    'font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#333333;line-height:1.6;background:#ffffff;">' +
    (b.text || '').replace(/\n/g, '<br>') +
    '</td>';
  const cells = b.order === 'img-right' ? txt + img : img + txt;
  return (
    '<tr><td style="padding:0;background:#ffffff;">' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>' +
    cells +
    '</tr></table></td></tr>'
  );
}

function renderFooter(b) {
  const copyright = b.copyright || '\xa9 2026 Ermes Dance Academy. All rights reserved.';
  const unsubLink = b.unsubLink || '#';
  const unsubText = b.unsubText || 'Unsubscribe';
  return (
    '<tr><td align="center" style="padding:30px;background:#000000;">' +
    '<img src="' + ERMES_LOGO + '" alt="Ermes Dance Academy" width="120"' +
    ' style="display:block;margin:0 auto 16px;border:0;filter:brightness(0) invert(1);">' +
    '<p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#999999;text-align:center;">' +
    copyright + '</p>' +
    '<a href="' + unsubLink + '"' +
    ' style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#666666;text-decoration:underline;">' +
    unsubText + '</a>' +
    '</td></tr>'
  );
}

function renderBlock(block) {
  switch (block.type) {
    case 'logo':    return renderLogo(block);
    case 'image':   return renderImage(block);
    case 'text':    return renderText(block);
    case 'button':  return renderButton(block);
    case 'divider': return renderDivider(block);
    case 'spacer':  return renderSpacer(block);
    case 'columns': return renderColumns(block);
    case 'footer':  return renderFooter(block);
    default:        return '';
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateEmailHtml(subject, blocks) {
  const rows = (blocks || []).map(renderBlock).join('\n        ');
  return (
    '<!DOCTYPE html>\n' +
    '<html>\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>' + (subject || 'Email') + '</title>\n' +
    '</head>\n' +
    '<body style="margin:0;padding:0;background:#f0f0f0;font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;">\n' +
    '  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;">\n' +
    '    <tr><td align="center" style="padding:20px 0;">\n' +
    '      <table width="600" cellpadding="0" cellspacing="0" border="0"\n' +
    '             style="max-width:600px;width:100%;background:#ffffff;">\n' +
    '        ' + rows + '\n' +
    '      </table>\n' +
    '    </td></tr>\n' +
    '  </table>\n' +
    '</body>\n' +
    '</html>'
  );
}
