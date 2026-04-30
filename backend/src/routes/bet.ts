import { Router } from 'express'
import { BetController } from '../controllers/BetController'
import { BetLockController } from '../controllers/BetLockController'
import Http from '../middlewares/Http'
import Passport from '../passport/Passport'
import { betLockValidation } from '../validations/bet-lock.validation'

export class BetRoute {
  public router: Router
  public betController: BetController = new BetController()
  public betLockController: BetLockController = new BetLockController()

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/placebet', Passport.authenticateJWT, this.betController.placebet)

    this.router.post('/getexposer', Passport.authenticateJWT, this.betController.getexposer)

    this.router.get('/bets', Passport.authenticateJWT, this.betController.betList)
    this.router.get('/bets22', Passport.authenticateJWT, this.betController.betList22)
    this.router.get('/matkabets22', Passport.authenticateJWT, this.betController.MatkabetList22)

    

        this.router.post('/bet32', Passport.authenticateJWT,this.betController.betList32)


    this.router.get('/matchdetail', Passport.authenticateJWT, this.betController.marketDetails)
        this.router.get('/matchdetail-two', Passport.authenticateJWT, this.betController.marketDetailstwo)

    this.router.get('/completedgames', Passport.authenticateJWT, this.betController.completedgames)
   this.router.get('/matkacompletedgames', Passport.authenticateJWT, this.betController.Matkacompletedgames)
    this.router.get('/completedgamescasino', Passport.authenticateJWT, this.betController.completedgamescasino)
    this.router.get('/marketcasino', Passport.authenticateJWT, this.betController.marketCasino)
    this.router.get('/marketmatka', Passport.authenticateJWT, this.betController.marketMatka)
    this.router.get('/bookmarketmatka', Passport.authenticateJWT, this.betController.bookmarketMatka)


    




    this.router.post(
      '/get-bet-list-by-ids',
      Passport.authenticateJWT,
      this.betController.getBetListByIds,
    )

    this.router.post('/alluserbetList', Passport.authenticateJWT, this.betController.alluserbetList)
    this.router.get('/alluserbetList22', Passport.authenticateJWT, this.betController.alluserbetList22)

    this.router.get(
      '/get-exposer-event',
      Passport.authenticateJWT,
      this.betController.getExposerEvent,
    )

    this.router.delete(
      '/delete-current-bet/:id',
      Passport.authenticateJWT,
      this.betController.deleteCurrentBet,
    )
     this.router.post(
      '/update-current-bet',
      Passport.authenticateJWT,
      this.betController.updateBet,
    )

    this.router.post('/delete-bets', Passport.authenticateJWT, this.betController.deleteBets)

    this.router.post(
      '/bet-lock',
      betLockValidation,
      Http.validateRequest,
      Passport.authenticateJWT,
      this.betLockController.betLock,
    )
    this.router.get(
      '/get-child-user-list',
      Passport.authenticateJWT,
      this.betLockController.getChildUserList,
    )
    this.router.post('/users-lock', Passport.authenticateJWT, this.betLockController.usersLock)
  }
}
