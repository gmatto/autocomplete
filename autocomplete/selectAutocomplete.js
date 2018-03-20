app.directive('selectAutocomplete', function () {
    return {
        template: '<ng-include src="getTemplateUrl()"/>',

        controller: [ '$scope', '$rootScope', 'templatePrefix',
            function ($scope, $rootScope, templatePrefix) {

            const sorting = $scope.sort || sort;
            const selectedIndex = parseInt($scope.selectedIdx) || 0;
            const defaultTemplates = ['single', 'singleSelect', 'multiple', 'multiSelect'];

            $scope.selected = selectedIndex;
            $scope.disabled = !!$scope.disabled;
            $scope.type = $scope.type || 'single';
            $scope.simplified = $scope.simplified || false;
            $scope.template = $scope.template || $scope.type;
            $scope.model = $scope.type == 'multiple' && !$scope.model ? [] : $scope.model;
            $scope.savedModel = $scope.model;
            $scope.total = $scope.totalitems || 0;
            $scope.lazyload = $scope.lazyload || false;
            $scope.lazyDataLoaded = true;
            $scope.lazyButtonPressed = false;
            $scope.allownew = $scope.allownew || false;
            $scope.loaded = true;
            $scope.failed = false;
            $scope.source = [];
            $scope.errorMsg = "";
            $scope.showFullList = false;
            $scope.showListText = 'Показать выбранные';
            $scope.placevalue = $scope.placevalue || 'Нажмите для выбора значений из списка ';

            if ($scope.mode == 'static') loadStatic();

            $scope.getTemplateUrl = function() {
                if ( defaultTemplates.indexOf($scope.template) == -1 ) return $scope.template;
                return templatePrefix.app + 'templates/' + $scope.template + '.html?build-num';
            }

            function loadStatic() {
                setTimeout(() => {
                    $scope.loaded = false;
                    $scope.getSource().then((data) => {
                        $scope.source = handleSource(data);
                        $scope._source = $scope.source.slice();
                        $scope.total = $scope._source.length;
                        if ($scope.limit && $scope.total > $scope.limit) {
                            $scope.source.length = $scope.limit;
                        }
                        $scope.failed = !$scope.source.length;
                        $scope.errorMsg = $scope.failed ? 'Ничего не найдено' : '';

                        $scope.loaded = true;
                        setTimeout(() => {
                            $scope.$apply();
                        });
                    });
                });
            }

            function applyModel(item) {
                switch($scope.type) {
                    case 'single':
                        $scope.model = item.input;
                        $scope.savedModel = $scope.model;
                        $scope.toggleSelect();
                        $scope.dataChange();
                        break;
                    case 'multiple':
                        $scope.getSelectedIndex(item) == -1 ? $scope.model.push(item) :
                            $scope.model.splice($scope.getSelectedIndex(item), 1);
                        break;
                }
            }

            $scope.select = function(item) {
                applyModel(item);
                $scope.item = item;
                $scope.id = item.id;
                $scope.text = getText($scope.model);
                if ($scope.type == 'multiple') setMultiButtonHeader();
                setTimeout(() => {
                    if ($scope.change != null) {
                        if ($scope.type == 'single')
                            $scope.change({ item: item });
                        else
                            $scope.change($scope.model);
                    }
                });
            };

            $scope.getSelectedIndex = function(item) {
                if (typeof $scope.model !== 'object') return -1;
                let entry = JSON.stringify(item);
                for (const [i, value] of $scope.model.entries()) {
                    if (JSON.stringify(value) === entry)
                        return i;
                }
                return -1;
            }

            $scope.restoreSaved = (timeout = 500) => {
                if ($scope.lazyButtonPressed) $scope.lazyButtonPressed = false;
                else if (!$scope.allownew && $scope.type == 'single')
                    setTimeout(function () {
                        if($scope.model !== '') $scope.model = $scope.savedModel;
                        $scope.$apply();
                    }, timeout);
            }

            function setMultiButtonHeader() {
                $scope.header = $scope.model.length > 0 ?
                    'Выбрано (' + $scope.model.length + '): ' + $scope.text : $scope.placevalue;
            }

            function sort(a, b) {
                if (a.sort < b.sort)
                    return -1;
                if (a.sort > b.sort)
                    return 1;
                return 0;
            }

            function handleSource(data, text) {
                text = typeof text == 'string' ? text : '';
                data = filter(data, text);
                data.sort(sorting);
                return data;
            }

            function filter(data, text) {
                text = text || '';
                text = removeSpecialSymbols(text);
                text = text.replace(/\(/g, "\\(");
                text = text.replace(/\)/g, "\\)");
                let reg = new RegExp(text, 'i');
                let results = [];
                for (let i = 0; i < data.length; i++) {
                    let item = data[i];
                    item.mText = item.text.replace(/[ё]/g, "е");

                    let match = reg.exec(item.text);
                    if (match == null) {
                        match = reg.exec(item.mText);
                    }
                    if (match != null ) {
                        item.input = match.input;
                        results.push(item);
                    }
                }
                return results;
            }

            $scope.openMenu = function () {
                $scope.showMenu();
                $scope.isPopupVisible = true;
            }

            $scope.closeMenu = function () {
                $scope.isPopupVisible = false;
                setTimeout(function () {
                    $scope.restoreSaved();
                    $scope.$apply();
                }, 0);
            };

            $scope.showMenu = function () {
                $scope.selected = selectedIndex;
                $scope.parentBtn = document.activeElement;
                if ($scope.parentBtn && $scope.parentBtn.tagName.toLowerCase() != 'button')
                    $scope.parentBtn = null;
                scrollActive(false, true);
                $scope.dataChange();
            }

            function isEmpty(obj) {
                for(var key in obj) {
                    if(obj.hasOwnProperty(key))
                        return false;
                }
                return true;
            }

            $scope.checkAll = function () {
                $scope.loaded = true;
                for (i = 0; i < $scope.source.length; i++) {
                    if ($scope.getSelectedIndex($scope.source[i]) == -1)
                        $scope.select($scope.source[i]);
                }
            };

            $scope.uncheckAll = function () {
                const checked = $scope.model.slice();
                $scope.loaded = true;
                for (i = 0; i < checked.length; i++) {
                    if ($scope.getSelectedIndex(checked[i]) > -1)
                        $scope.select(checked[i]);
                }
            };

            function focusSearchInput() {
                const activeInput = angular.element( document.querySelector(".active-search") ) || null;
                if (activeInput && Object.keys(activeInput).length !== 0) {
                    activeInput.focus();
                    activeInput.click();
                }
            }

            $scope.loadMore = function (activateNewItem = false) {
                if(!$scope.lazyDataLoaded) return;
                $scope.lazyButtonPressed = true;
                $scope.lazyDataLoaded = false;
                if ($scope.mode == 'static') {
                    let start = $scope.source.length;
                    if (! ($scope.type == 'single' && !$scope.simplified) ) setQuery();
                    let source = filter($scope._source, $scope.query).slice(start, start + $scope.limit);
                    $scope.source = $scope.source.concat(source);
                    $scope.lazyDataLoaded = true;
                    if(activateNewItem) $scope.model = $scope.source[$scope.selected].input;
                    setTimeout(() => {
                        focusSearchInput();
                        $scope.$apply();
                    }, 0);
                }
                else {
                    setTimeout(() => {
                        $scope.start = $scope.source.length;
                        if($scope.type == 'single' && !$scope.simplified) $scope.model = $scope.query;
                        $scope.$apply();
                        $scope.getSource().then((data) => {
                            $scope.source = $scope.source.concat(handleSource(data, $scope.query));
                            $scope.lazyDataLoaded = true;
                            if(activateNewItem && $scope.source.length >= $scope.selected )
                                $scope.model = $scope.source[$scope.selected].input;
                        });
                    }, 0);
                }
            }

            $scope.showAll = function () {
                $scope.showFullList = !$scope.showFullList;
                $scope.showListText = $scope.showFullList ? 'Скрыть' : 'Показать выбранные';
            };

            function setQuery() {
                $scope.query = $scope.search.text || '';
                if ($scope.type == 'single' && !$scope.simplified)
                    $scope.query = $scope.model;
            }

            $scope.dataChange = function () {
                $scope.selected = selectedIndex;
                if ($scope.savedModel == undefined) $scope.savedModel = $scope.model;
                if (typeof $scope.model == 'string')
                    $scope.model = removeSpecialSymbols($scope.model);
                if ($scope.model == '')
                    setTimeout(() => {
                        $scope.savedModel = '';
                        $scope.item = null;
                        $scope.id = null;
                        $scope.$apply();
                    }, 0);
                setQuery();

                if ($scope.start) $scope.start = 0;
                setTimeout(() => {
                    $scope.$apply();
                    $scope.mode == 'static' ? dataChangeStatic() : dataChangeDynamic();
                }, 0);
            };

            function dataChangeStatic () {
                let source = filter($scope._source, $scope.query);
                $scope.total = source.length;
                if ($scope.limit && $scope.total > $scope.limit) {
                    source.length = $scope.limit;
                }
                $scope.source = source;
                $scope.failed = !$scope.source.length;
                $scope.errorMsg = $scope.failed ? 'Ничего не найдено' : '';
                $scope.loaded = true;
                setTimeout(() => {
                    focusSearchInput();
                    $scope.$apply();
                }, 0);
            }

            function dataChangeDynamic () {
                setTimeout(() => {
                    $scope.$apply();
                    if ($scope.model == '' || $scope.model == []) {
                        if ($scope.change != null) {
                            if ($scope.type == 'single')
                                $scope.change({ item: $scope.item });
                            else
                                $scope.change($scope.model);
                        }
                    }

                    $scope.loaded = false;
                    $scope.getSource().then((data) => {
                        $scope.source = handleSource(data, $scope.query);
                        $scope._source = $scope.source.slice();
                        $scope.failed = !$scope.source.length;
                        $scope.errorMsg = $scope.failed ? 'Ничего не найдено' : '';
                        $scope.loaded = true;
                        setTimeout(() => {
                            focusSearchInput();
                            $scope.$apply();
                        })
                    });
                }, 0);
            }

            function getParentPopup(elem) {
                for ( ; elem && elem !== document; elem = elem.parentNode ) {
                    if ( elem.matches( '.popup' ) ) return elem;
                }
                return null;
            }

            function scrollActive(bottom = false, scrollToTop = false) {
                try {
                    if (!$scope.autosearch) event.preventDefault();

                    let current = document.getElementById($scope.selector);
                    let option = angular.element(current.querySelector('.active'));
                    if (option[0] != null) option = option[0];

                    let popup = getParentPopup(option);
                    let parent = option.parentNode;
                    if (parent[0] != null) parent = parent[0];
                    if (popup == null) popup = parent;
                    let parentY = parent.getBoundingClientRect().top - popup.getBoundingClientRect().top;

                    let ot = option.offsetTop;
                    if (bottom) ot = ot - parentY - option.clientHeight * 2;
                    else ot = ot - parentY - option.clientHeight * 4;

                    if(scrollToTop) ot = 0;
                    parent.scrollTop = ot;
                } catch (e) {}
            }

            $scope.initLazyLoadOnScroll = function() {
                if ($scope.lazyload && $scope.lazyload == 'scroll') {
                    let parent = document.getElementById($scope.selector);
                    let list = parent.querySelector('.lazyscroll');
                    let elem = angular.element(list)[0];
                    angular.element(list).on('scroll', function (e) {
                        let height = elem.clientHeight;
                        if (elem.scrollHeight - elem.scrollTop <= height)
                            $scope.loadMore();
                    });
                }
            };

            $scope.keyDown = function(event) {
                let update = false;
                switch (event.keyCode) {
                    case 9: // Tab
                        $scope.restoreSaved(0);
                        $scope.closeMenu();
                        break;
                    case 38: // ArrowUp
                        $scope.selected--;
                        update = true;
                        scrollActive();
                        break;
                    case 40: // ArrowDown
                        if($scope.isPopupVisible) $scope.selected++;
                        if(!$scope.isPopupVisible) $scope.openMenu();
                        update = true;
                        scrollActive(true);
                        break;
                    case 13: // Enter
                        if ($scope.lazyload && $scope.selected == $scope.source.length) {
                            let activateNewItem = $scope.type == 'single' && !$scope.simplified;
                            $scope.loadMore(activateNewItem);
                        }
                        else if ($scope.isPopupVisible && $scope.source.length > 0 && $scope.selected > -1) {
                            event.preventDefault();
                            $scope.select($scope.source[$scope.selected]);
                        }
                        break;
                    case 16: // Shift
                        break;
                    case 17: // Ctrl
                        break;
                    case 27: // Esc
                        scrollActive(false, true);
                        $scope.closeMenu();
                        if (!!$scope.parentBtn) $scope.parentBtn.focus();
                        break;
                    default:
                        if ($scope.type == 'single') $scope.isPopupVisible = true;
                }

                if ($scope.selected < 0)
                    $scope.selected = selectedIndex;

                const count = $scope.source.length;
                let total = $scope.totalitems || $scope.total;
                if ($scope.selected >= count && count < total && $scope.lazyload) {
                    $scope.selected = count;
                }
                else if ($scope.selected >= count && $scope.selected > selectedIndex)
                    $scope.selected = count - 1;

                if (update) {
                    if ($scope.type == 'single' && !$scope.simplified) {
                        let item = $scope.source[$scope.selected];
                        if (!!item) {
                            $scope.model = item.input;
                            $scope.id = item.id;
                        }
                    }
                }

                if ($scope.ngKeyDown != null) {
                    $scope.ngKeyDown(event);
                }
            };

            function removeSpecialSymbols(text, additional) {
                const st = '\\/\\\\|\\!\\?\\@\\#\\$\\%\\^\\&\\*\\{\\}\\[\\]\\;\\<\\>\\"\\\'\\:\\+\\_';
                const rs = (additional == null) ? st : st + '\\' + additional.join('\\');
                const reg = new RegExp('[' + rs + ']+', 'ig');
                return text.replace(reg, '');
            }

            function getText(model) {
                if (typeof model == 'string') return model;
                if (typeof model != 'object') return '';
                let tarr = [];
                for (let key in model) {
                    if (!model.hasOwnProperty(key)) continue;
                    tarr.push(model[key].text);
                }
                return tarr.join(', ');
            }

            $scope.$watch('model', function (model) {
                if ($scope.type == 'single' && !$scope.item)
                    $scope.item = {input : $scope.model ? $scope.model : null};
                $scope.text = getText(model);
                if ($scope.type == 'multiple') setMultiButtonHeader();
            });

        }],
        scope: {
            type: '@type',
            mode: '@mode',
            template: '@template',
            title:  '@title',
            placevalue: '@placeholder',
            field: '@field',
            disabled: '@disabled',
            tabindex: '@tabIndex',
            lazyload: '@lazyload',
            hint: '@?hint',
            selectedIdx: '@?selectedIndex',
            autosearch: '=autosearch',
            errors: '=errors',
            model: '=model',
            query: '=?query',
            totalitems: '=total',
            ngKeyDown: '=ngKeyDown',
            start: '=start',
            limit: '=limit',
            sort: '=sort',
            id:  '=?id',
            item: '=?item',
            showExtraButtons: '=?showExtraButtons',
            getSource: '&src',
            change: '&?change',
            allownew: '@allowNewModels',
            simplified: '@simplified'
        },
        link: function(scope, element) {
            scope.search = {};
            scope.isPopupVisible = false;
            let el = element[0];
            scope.selector = el.id = el ? 'autocomplete-' + scope.$id : null;

            scope.toggleSelect = function(){
                if (!scope.isPopupVisible) scope.showMenu();
                scope.restoreSaved();
                scope.isPopupVisible = !scope.isPopupVisible;
                if (!!scope.parentBtn) scope.parentBtn.focus();
            }

            angular.element(document).bind('click', function(event){
                let isClickedElementChildOfPopup = element[0].contains(event.target);

                if (isClickedElementChildOfPopup)
                    return;

                scope.isPopupVisible = false;
                scope.$apply();
            });

        }

    }
});
