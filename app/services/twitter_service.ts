import puppeteer from 'puppeteer'
import { randomInt } from 'crypto'
import Account from '#models/account'

const SESSION_COOKIE = 'auth_token=6e03b7708ad10ee990c9ccbd13f13535c010fa6b'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export class TwitterService {
  token = ''
  constructor() {

  }

  async initializeAccount() {
    const account = await Account.query().where('status', 'active').first()
    if (!account) throw new Error('No active Twitter account found')
    this.token = account.authToken
  }

   private parseContent(content = '', url: string) {
    const tweetId = url.split('/').pop()
    const lines = content.split('\n')

    let name
    let username
    let date
    let bodyLines
    let pinned = false
    let reposted = false

    if (lines[0] === 'Pinned') {
      ;[name, username, , , date, ...bodyLines] = lines
      pinned = true
    } else if (lines[0].includes('reposted')) {
      ;[name, username, , , date, ...bodyLines] = lines
      reposted = true
    } else {
      ;[name, username, , , date, ...bodyLines] = lines
    }

    const [comments, retweets, likes, impressions] = bodyLines.slice(-4)
    let text = bodyLines.slice(0, -4).join('\n')

    let quoted = null
    if (text.includes('·')) {
      const [main, quotePart] = text.split('Quote')
      text = main.trim()

      const quoteLines = quotePart.trim().split('\n')
      if (quoteLines.length >= 3) {
        quoted = {
          name: quoteLines[0],
          username: quoteLines[1],
          date: quoteLines[2],
          content: quoteLines.slice(3).join('\n'),
        }
      }
    }

    return {
      tweetId,
      name,
      username,
      date,
      pinned,
      reposted,
      content: text,
      quoted,
      comments,
      retweets,
      likes,
      impressions,
    }
  }

  private async extractTweets(page) {
    return await page.evaluate(() => {
      const tweets = Array.from(document.querySelectorAll('article'))

      return tweets.map((article) => {
        const button = article.querySelector('button')
        if (button && button.textContent === 'Show more') {
          button.click()
        }

        const content = article.innerText
        const timeEl = article.querySelector('time')
        const timestamp = timeEl ? timeEl.getAttribute('datetime') : null
        const url = timeEl ? timeEl.closest('a')?.href : null

        return { content, timestamp, url }
      })
    })
  }

  async getTweets(username: string, untilDate: string) {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // args: ['--no-sandbox']
    })

    await browser.setCookie({
      name: 'auth_token',
      value: SESSION_COOKIE.split('=')[1],
      domain: '.x.com',
    })

    const page = await browser.newPage()

    await page.goto(`https://x.com/${username}`, {
      waitUntil: 'networkidle2',
      timeout: 0,
    })

    let tweetsSet = new Set()

    let prevSize = 0

    for (let i = 0; i < 10; i++) {
      const rawTweets = await this.extractTweets(page)

      for (const tweet of rawTweets) {
        const tweetTime = tweet.timestamp ? DateTime.fromISO(tweet.timestamp) : null
        if (tweetTime && tweetTime < DateTime.fromISO(untilDate)) continue
        tweetsSet.add(JSON.stringify(tweet))
      }

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await delay(2000 + randomInt(3000))

      if (tweetsSet.size === prevSize) break
      prevSize = tweetsSet.size
    }

    await browser.close()

    let tweets = Array.from(tweetsSet).map((x: any) => JSON.parse(x))
    tweets = tweets.map((x) => ({ ...x, raw: x.content, ...this.parseContent(x.content, x.url) }))

    return tweets
  }
}
