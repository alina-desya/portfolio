<?xml version="1.0" encoding="UTF-8"?>
<!-- Makes the sitemap readable in a browser. Search engines ignore this file. -->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Sitemap — Alina Desiatnikova</title>
        <style>
          body { margin: 0; background: #faf8f5; color: #1b1d22; font: 16px/1.6 system-ui, -apple-system, 'Segoe UI', sans-serif; }
          main { max-width: 860px; margin: 0 auto; padding: 56px 24px; }
          .eyebrow { color: #0e6e6a; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
          h1 { font-family: Georgia, serif; font-size: 2.2rem; margin: 8px 0 8px; }
          p { color: #5c6068; margin: 0 0 28px; }
          table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e4dfd7; border-radius: 12px; overflow: hidden; }
          th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #e4dfd7; }
          th { background: #f2eee8; font-size: 0.85rem; }
          td.n { color: #5c6068; width: 1%; white-space: nowrap; }
          a { color: #0e6e6a; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <main>
          <span class="eyebrow">Sitemap</span>
          <h1>alinadocs.com</h1>
          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <p>This index points to the list of pages. Search engines use this file to find every page on the site.</p>
              <table>
                <tr><th>#</th><th>Sitemap</th></tr>
                <xsl:for-each select="s:sitemapindex/s:sitemap">
                  <tr>
                    <td class="n"><xsl:value-of select="position()" /></td>
                    <td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
                  </tr>
                </xsl:for-each>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <p><xsl:value-of select="count(s:urlset/s:url)" /> pages. Search engines use this file to find every page on the site.</p>
              <table>
                <tr><th>#</th><th>Page</th></tr>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td class="n"><xsl:value-of select="position()" /></td>
                    <td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
                  </tr>
                </xsl:for-each>
              </table>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
