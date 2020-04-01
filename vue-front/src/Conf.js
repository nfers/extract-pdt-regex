import Vue from 'vue';
import ViewUI from 'view-design';
import locale from 'view-design/dist/locale/pt-BR';
import router from './router'
import axios from 'axios'

export default class Config{
    iView(){
        Vue.use(ViewUI, { locale });
        router.beforeEach((to, from, next) => {
            ViewUI.LoadingBar.start();
            next();
        });
        
        router.afterEach(() => {
            ViewUI.LoadingBar.finish();
        });

        return this;
    }
    request(){
        axios.defaults.baseURL = 'http://localhost:3000'

        const openRequest = (config) =>{
            ViewUI.LoadingBar.start();
            return config;
        }
        const errRequest = (error) =>{
            ViewUI.LoadingBar.error();
            return Promise.reject(error);
        }

        axios.interceptors.request.use(openRequest, errRequest);
        
        const validaterequest = async (resp) =>{
            try{
                if(resp){
                    if (typeof resp.data === 'object') {
                        if (!resp.data.success) { 
                            ViewUI.Notice.error({
                                title: 'Error! ',
                                desc: resp.data.message ? resp.data.message : 'Não foi possivel realizar está operação'
                            });
                        }
                    }
                }
            }catch(e){
                ViewUI.Notice.error({
                    title: 'Error! ',
                    desc: 'Resposta não esperada do servidor'
                });
            }
        }
        
        axios.interceptors.response.use(
            resp => {
                validaterequest(resp);
                ViewUI.LoadingBar.finish();
                return resp;
            },
            err => {
                if (axios.isCancel(err)) {
                    console.log('Request canceled', err.message);
                }
                else {
                    validaterequest(err.response);
                    ViewUI.LoadingBar.error();
                    return Promise.reject(err);
                }
            },
        );
        return this;
    }
}