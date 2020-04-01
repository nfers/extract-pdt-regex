<template>
<div id="scraping-pdf">
    <Upload
        type="drag"
        :format="['pdf']"
        :on-success="handleSuccess"
        :on-format-error="handleFormatError"
        :action="`${baseURL}`">
        <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>Clique ou arraste o PDF aqui.</p>
        </div>
    </Upload>
    
    <br>
    <hr>
    <br>
    <h2>Regras Geral</h2>
    <Form>
        <row :gutter="20">
            <i-col :sm="6">
                <FormItem label="Nome">
                    <i-input v-model="rule.name"></i-input>
                </FormItem>
            </i-col>
        </row>
        <row :gutter="20">
            <i-col :sm="24">
                <label>Delimitador Inicio: &nbsp;</label>
                <div v-if="rule.startregex">
                    <span v-for="(item, index) in rule.startregex" :key="index">
                        {{ item.label }} &nbsp;
                    </span>
                </div>
            </i-col>


            <i-col :sm="5" v-for="(item, index) in regexs" :key="index">
                <Button long  @click="addRuleStartRegex(item)" style="margin-top: 10px">
                    {{ item.label }}
                </Button>
            </i-col>
        </row>

        <row :gutter="20">
            <i-col :sm="24">
                <label>Delimitador Final: &nbsp;</label>
                <div v-if="rule.endregex">
                    <span v-for="(item, index) in rule.endregex" :key="index">
                        {{ item.label }} &nbsp;
                    </span>
                </div>
            </i-col>


            <i-col :sm="5" v-for="(item, index) in regexs" :key="index">
                <Button long  @click="addRuleEndRegex(item)" style="margin-top: 10px">
                    {{ item.label }}
                </Button>
            </i-col>
        </row>
        <row>
            <i-col :sm="6">
                <FormItem>
                    <Button type="success" long @click="rules.push(rule); rule= {}">Add.</Button>
                </FormItem>
            </i-col>
        </row>
    </Form>

    <List  border>
        <ListItem v-for="(item, index) in rules" :key="index">
           Nome: {{item.name}} - Regex: /{{item.startregex.reduce((r,c) => r+c.value, '')}}((\\s*?.\\s*?)+?){{item.endregex.reduce((r,c) => r+c.value, '')}}/igm
        </ListItem>
    </List>
    <h2>Regras Campos</h2>

    <Form>
        <row :gutter="20">
            <i-col :sm="6">
                <FormItem label="Nome">
                    <i-input v-model="attribute.name"></i-input>
                </FormItem>
            </i-col>
        </row>
        <row :gutter="20">
            <i-col :sm="24">
                <label>Delimitador Inicio: &nbsp;</label>
                <div v-if="attribute.startregex">
                    <span v-for="(item, index) in attribute.startregex" :key="index">
                        {{ item.label }} &nbsp;
                    </span>
                </div>
            </i-col>


            <i-col :sm="5" v-for="(item, index) in regexs" :key="index">
                <Button long  @click="addAttrStartRegex(item)" style="margin-top: 10px">
                    {{ item.label }}
                </Button>
            </i-col>
        </row>
        <row :gutter="20">
            <i-col :sm="24">
                <label>Delimitador Final: &nbsp;</label>
                <div v-if="attribute.endregex">
                    <span v-for="(item, index) in attribute.endregex" :key="index">
                        {{ item.label }} &nbsp;
                    </span>
                </div>
            </i-col>


            <i-col :sm="5" v-for="(item, index) in regexs" :key="index">
                <Button long  @click="addAttrEndRegex(item)" style="margin-top: 10px">
                    {{ item.label }}
                </Button>
            </i-col>
        </row>
        <row>
            <i-col :sm="6">
                <FormItem>
                    <Button type="success" long @click="attributes.push(attribute); attribute = {}">Add.</Button>
                </FormItem>
            </i-col>
        </row>
    </Form>

    <List  border>
        <ListItem v-for="(item, index) in (attributes || [])" :key="index">
           Nome: {{item.name}} - Regex: /{{item.startregex.reduce((r,c) => r+c.value, '')}}((\\s*?.\\s*?)+?){{item.endregex.reduce((r,c) => r+c.value, '')}}/igm
        </ListItem>
    </List>


    <br><br>

    <Button @click="gerarJSON">Gerar JSON</Button>

    <code style="white-space: pre-wrap; word-wrap: break-word;">
        {{ json }}
    </code>

    <div style="white-space: pre-wrap; word-wrap: break-word; font-family: inherit;"> 
        {{text}}
    </div>

    <br>
    <hr>
    <br>
    <div v-html="htmlPDF" ref="pdf"/>
</div>    
</template>

<script>
import axios from 'axios';

export default {
    data(){
        return{
            rule: {},
            attribute: {},
            htmlPDF: '',
            text: '(dddd)',
            json: '',
            regexs: [
                {value: '\\s{1,}', label: 'Espaços'},
                {value: '[a-zA-Z]{1,}', label: 'Letras'},
                {value: '(\\s[a-zA-Z]\\s?){1,}', label: 'Letras com espaços'},
                {value: '[0-9]{1,}', label: 'Números'},
                {value: '[0-9a-zA-Z]{1,}', label: 'Alfanumerico'},
                {value: '(\\s*?[0-9a-zA-Z]\\s*?){1,}', label: 'Alfanumerico com espaços'},
                {value: '\\(', label: "Abre parentes"},
                {value: '\\)', label: "Fecha parentes"},
                {value: '^[1-9][0-9]{0,2}(\\.?[0-9]{3})*(,[0-9]{2})?$', label: 'Valor monetário'},
                {value: ':', label: 'Dois pontos (:)'}
            ],
            rules: [],
            attributes: [],
        }
    },
    computed: {
        baseURL: () => axios.defaults.baseURL
    },
    methods: {
        handleFormatError (file) {
            this.$Notice.warning({
                title: 'Formato inválido',
                desc: 'Arquivo ' + file.name + ' está incorreto, somente PDF é aceito'
            });
        },
        handleSuccess (resp, file) {
            if(resp && resp.data){
                if(resp.success){
                    const html =  resp.data.html ? resp.data.html : '';
                    this.text = resp.data.text ?  resp.data.text : '';

                    this.htmlPDF = html
                        .replace(/id="sidebar"/img, '')
                        .replace(/id="page-container"/img, '')
                }
                else{
                     this.$Notice.error({
                        title: 'Error! ',
                        desc: resp.message ? resp.message : 'Não foi possivel realizar está operação'
                    });
                }
            }
            else{
                this.$Notice.error({
                    title: 'Error! ',
                    desc: `Resposta não esperada, arquivo: ${file.name}`
                });
            }
            
        },
        addRuleStartRegex(item){
            this.rule = {
                ...this.rule,
                startregex:  this.rule.startregex ? [... this.rule.startregex, item] : [item]
            }
        },
        addRuleEndRegex(item){
            this.rule = {
                ...this.rule,
                endregex:  this.rule.endregex ? [... this.rule.endregex, item] : [item]
            }
        },
        addAttrStartRegex(item){
            this.attribute = {
                ...this.attribute,
                startregex:  this.attribute.startregex ? [... this.attribute.startregex, item] : [item]
            }
        },
        addAttrEndRegex(item){
            this.attribute = {
                ...this.attribute,
                endregex:  this.attribute.endregex ? [... this.attribute.endregex, item] : [item]
            }
        },
        gerarJSON(){
            const json = [];
            let matches = [this.text];
            for(const rule of this.rules){
                const regex = new RegExp(
                      rule.startregex.reduce((r,c) => r+c.value, '')
                    + '((\\s*?.\\s*?)+?)'
                    + rule.endregex.reduce((r,c) => r+c.value, '')
                , 'igm');
                let matchesRule = [];
                for(const match of matches){
                    matchesRule = matchesRule.concat(match.match(regex));
                }

                matches = matchesRule;
            }

            for(const match of matches){
                const obj = {};
                const attributesjson = new Set();

                for(const attribute of this.attributes){
                    attributesjson.add(attribute.name);
                    
                }

                for(const attributejson of attributesjson){
                    let values = [match];
                    for(const attr of this.attributes.filter(a => a.name == attributejson)){
                        const regex = new RegExp(
                            attr.startregex.reduce((r,c) => r+c.value, '')
                            + '((\\s*?.\\s*?)+?)' //'(.+?)'
                            + attr.endregex.reduce((r,c) => r+c.value, '')
                        , 'igm');


                        let matchesAttr = [];
                        for(const value of values){
                            matchesAttr= matchesAttr.concat(value.match(regex));
                        }

                        values = matchesAttr;
                    }

                    obj[attributejson] = values;
                }
                json.push(obj);
            }

            console.log(json);

            this.json = JSON.stringify(json, undefined, 4);
        }
    },
    mounted () {
        const  listener = (e) =>{
            const oldsElDocument = document.querySelectorAll('.selected-el-scraping');

            for(const el of oldsElDocument){
                const classRemoves = [
                    'selected-el-scraping', 
                    'mouseover',
                    'scraping-vertical',
                    'scraping-horizontal'
                ];
                for(const c of classRemoves){
                    if(el.classList.contains(c)){
                         el.classList.remove(c);
                    }
                }
            }

            let el = e.toElement
            
            const selector = el.tagName + Array.from(el.classList).reduce((str, current) =>str + `.${current}`, '');
            const mouseOverElement = el;

            while(
                el.tagName.toLowerCase() != 'div'
                || !el.parentElement.classList.contains('pc')
            ){
                el = el.parentElement;
            }

            if(selector != mouseOverElement){
                el.querySelector(selector).classList.add("selected-el-scraping");
                el.querySelector(selector).classList.add("mouseover");
            }
            else{
                el.classList.add("selected-el-scraping");
                el.classList.add("mouseover");
            }
            

            const elClass = el.getAttribute('class');
            const idClass = el.classList[0];
            const verticalClass = /(?<vertical>x[a-zA-Z0-9]{1,})/.exec(elClass).groups.vertical;
            //const horizontalClass = /(?<horizontal>y[a-zA-Z0-9]{1,})/.exec(elClass).groups.horizontal;

            const verticalElements = document.querySelectorAll(`.${idClass}.${verticalClass} ${selector}`)
            
            for(const el of Array.from(verticalElements)){
                if(!el.classList.contains('mouseover')){
                    el.classList.add("selected-el-scraping");
                    el.classList.add("mouseover");
                }
            }

        }

        this.$refs['pdf'].addEventListener('mouseover', listener, true);
    }
}
</script>

<style>
#scraping-pdf{
    margin: 50px;
    padding: 10px;
    border: 1px solid #dcdee2;
    border-radius: 5px;
    background-color: #FFF;
}

#scraping-pdf .selected-el-scraping.mouseover *,
#scraping-pdf .selected-el-scraping.mouseover *::after,
#scraping-pdf .selected-el-scraping.mouseover *::before,
#scraping-pdf .selected-el-scraping.mouseover,
#scraping-pdf .selected-el-scraping.mouseover::after,
#scraping-pdf .selected-el-scraping.mouseover::before {
    cursor: pointer;
    color: #19be6b !important;
}

</style>