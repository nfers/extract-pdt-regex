import Vue from 'vue'
import VueRouter from 'vue-router'
import ScrapingPDF from '../views/ScrapingPDF'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'scrapingPDF',
    component: ScrapingPDF
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
