var app = angular.module("testAutocompleteApp",[]);
app.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
});
app.constant('templatePrefix', { app: '//raw.githubusercontent.com/gmatto/autocomplete/master/autocomplete/' } );
app.controller('testAutocompleteCtrl', ['$scope', '$q', function ($scope, $q) {
        $scope.errors = {};
        let modelNames = [
            'tab1_st1', 'tab1_st2', 'tab1_st3', 'tab1_st4',
            'tab1_dn1', 'tab1_dn2', 'tab1_dn3', 'tab1_dn4',
            'tab2_st1', 'tab2_st2', 'tab2_st3', 'tab2_st4', 'tab2_st5', 'tab2_st6',
            'tab2_dn1', 'tab2_dn2', 'tab2_dn3', 'tab2_dn4', 'tab2_dn5', 'tab2_dn6'
        ];
        let operation = 'save';

        function createItem(dict) {
            const extraParsed = {};
            Object.values(dict).map(
                (value) => {
                if (typeof value === 'string')
            extraParsed[value] = '';
        }
        );
            return {
                dictval_CODE: '',
                aname: '',
                adesc: '',
                extraParsed: extraParsed
            }
        }

        function createModel(dict) {
            let models = {};
            let items = {};
            let query = {};
            let start = {};
            let total = {};
            Object.values(dict).map(
                (value) => {
                models[value.toLowerCase()] = '';
            items[value.toLowerCase()] = null;
            query[value.toLowerCase()] = '';
            start[value.toLowerCase()] = 0;
            total[value.toLowerCase()] = 0;
        }
        );
            return {
                models: models,
                items: items,
                query: query,
                start: start,
                total: total,
                entryTime: null
            };
        }

        function queryDictionary(code, query, limit, start) {
            let data = [
                "(03) Производственная", "(03) Русские классические произведения", "(12) Литературное обозрение,монтаж",
                "(08) Комсомольско-молодежная", "(06) Семейно-бытовая", "(10) Антирелигиозная", "(03) Русские классические произведения", "(033) Абхазия", "(39) Абазинский", "(83) Арабский", "(95) Ассирийский",
                "(47) Алтайский", "(20) Башкирский", "(99) Африканас", "(90) Бирманский", "(78) Др.языки народов Америки",
                "(51) Английский", "(34) Аварский", "(64) Македонский"];
            return $q.when({data: data, total: data.length});
        }

        function getDictionary(code, modelName, query, limit, start) {
            return queryDictionary(code, query, limit, start).then((response) => {
                console.log(response.data);
            if ($scope.userForm.hasOwnProperty('total'))
                $scope.userForm.total[modelName] = response.total;
            return Promise.resolve(formatDictionary(response.data));
        }).catch(() => {
                return Promise.resolve([]);
        });
        }

        $scope.getDictionarySingle = (code, model, limit) => {
            let modelName = model || Object.keys($scope.const).find(key => $scope.const[key] === code).toLowerCase();
            let query = $scope.userForm.hasOwnProperty('models') && $scope.userForm.models[modelName] != undefined ? $scope.userForm.models[modelName] : '';
            let match = /\(?(\d+)\)?.*$/.exec(query);
            let search = ((match == null) || (match[1] == null)) ? query : match[1];
            let start = $scope.userForm.hasOwnProperty('start') && $scope.userForm.start[modelName] != undefined ? $scope.userForm.start[modelName] : 0;
            return getDictionary(code, modelName, search, limit, start);
        };

        $scope.getDictionarySingleSelect = (code, model, limit) => {
            let modelName = model || Object.keys($scope.const).find(key => $scope.const[key] === code).toLowerCase();
            let query = $scope.userForm.hasOwnProperty('query') && $scope.userForm.query[modelName] != undefined ? $scope.userForm.query[modelName] : '';
            let start = $scope.userForm.hasOwnProperty('start') && $scope.userForm.start[modelName] != undefined ? $scope.userForm.start[modelName] : 0;
            limit = limit || 500;
            return getDictionary(code, modelName, query, limit, start);
        };

        function formatDictionary(data, onItem) {
            let res = [];
            for (let i = 0; i < data.length; i++) {
                res.push({ text: data[i], id: i });
            }
            return res;
        }

        $scope.getTotal = function(modelName) {
            return $scope.userForm.hasOwnProperty('total') ? $scope.userForm.total[modelName] : 0;
        };

        $scope.userForm = createModel(modelNames);

        $scope.isVisible = true;
        let sampleSavedModels = {
            tab1_st1: "(03) Производственная",
            tab1_dn1: "(03) Русские классические произведения",
            tab1_st2: "(12) Литературное обозрение,монтаж",
            tab1_dn2: "(08) Комсомольско-молодежная",
            tab1_st3: "(06) Семейно-бытовая",
            tab1_dn3: "(10) Антирелигиозная",
            tab1_st4: "(03) Производственная",
            tab1_dn4: "(03) Русские классические произведения",
            tab2_st1: "(033) Абхазия",
            tab2_st2: "(39) Абазинский",
            tab2_st3: "(83) Арабский",
            tab2_st4: "(95) Ассирийский",
            tab2_st5: "(47) Алтайский",
            tab2_st6: "(20) Башкирский",
            tab2_dn1: "(99) Африканас",
            tab2_dn2: "(90) Бирманский",
            tab2_dn3: "(78) Др.языки народов Америки",
            tab2_dn4: "(51) Английский",
            tab2_dn5: "(34) Аварский",
            tab2_dn6: "(64) Македонский"
        };

        for (let key in sampleSavedModels) {
            if (!sampleSavedModels.hasOwnProperty(key)) continue;
            $scope.userForm.models[key] = sampleSavedModels[key];
        }

        $scope.invalidateText = 'Invalidate all';
        $scope.disableText = 'Disable all';

        $scope.invalidate = () => {
            $scope.invalidateText = $scope.invalidateText == 'Invalidate all' ? 'Validate all' : 'Invalidate all';
        }

        $scope.disable = () => {
            $scope.disableText = $scope.disableText == 'Disable all' ? 'Enable all' : 'Disable all';
        }

    }]);