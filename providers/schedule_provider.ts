import env from '#start/env'
import type { ApplicationService } from '@adonisjs/core/types'
import { TwitterService } from '#services/twitter_service'
import schedule from 'node-schedule'
import Tweet from '#models/tweet';
import User from '#models/user';
import { DateTime } from 'luxon';
import Hash from '@adonisjs/core/hash'
import hash from '@adonisjs/core/services/hash';

export default class ScheduleProvider {
  constructor(protected app: ApplicationService) {}

  async saveTweet(tweet: any, currentUser: any) {
    //

    const contentHash = await hash.make(`${tweet.timestamp}-${tweet.content}-${user.id}`)

    const existingTweet = await Tweet.query().where('hash', contentHash).first()
    if (existingTweet) return

    let user = await User.query().where('username', tweet.username).first()

    let userId: any = null
    if(user) {
      userId = user.id
    } else {

      // do not fetch other tweets of random users found while fetching active users (when they retweet someone else's tweets)
      user = await User.create({
        name: tweet.name,
        username: tweet.username,
        status: 'disabled',
      })
      userId = user.id
    }

    await Tweet.create({
      tweetId: tweet.tweetId,
      likes: tweet.likes,
      impressions: tweet.impressions,
      retweets: tweet.retweets,
      content: tweet.content,
      repostedById: currentUser.id,
      isPinned: tweet.pinned,
      timestamp: tweet.timestamp,
      url: tweet.url,
      // ... other
    })
    // check if tweet exists based on hash (timestamp, content and username)
    //
    // if exists, skip
    // otherwise save tweet
  }

  /**
   * The application has been booted
   */
  async start() {
    if(env.get('START_TWITTER_CRON') !== '1') return

    schedule.scheduleJob('fetch tweets', '* 0 * * *', async () => {
      const service = new TwitterService()

      const users = await User.query().limit(10)
      const until = DateTime.now().minus({ minutes: 60 }).toISO()

      for (let user of users) {
        const tweets = await service.getTweets(user.username, until)

        for(let tweet of tweets) {
          await this.saveTweet(tweet, user)
        }
      }
    })
  }
}
