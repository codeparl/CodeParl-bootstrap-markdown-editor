;
(function(window, document, undefined) {

    "use strict";

    //This is a syntax highlighting plugin
    if (window.Prism)
        window.Prism.manual = true;

    if (window.$)
        $ = window.$;
    //define the mehods 
    // converter.setFlavor('github');
    var namespace = 'codeparlMarkdown',
        plugin = null,
        defaults = {
            previewOnly: false,
            markdown: '',
            fullscreen: true,
            content: {
                allowScript: false,
                image: {
                    types: '.jpeg,.jpg,.png,.gif',
                    placeholder: "../src/photo-placeholder.jpg",
                    backendScript: ""

                }
            },
            help: {
                show: true,
                link: {
                    url: "https://www.markdownguide.org/basic-syntax/",
                    text: "Advanced help"
                }
            },
            editor: {
                softTabs: true,
                theme: 'tomorrow',
                editorHeight: 500,
                fontSizes: {
                    Small: 12,
                    Normal: 16,
                    Large: 18,
                    Xlarge: 26
                },
                defaultFont: 'Normal',
                showGutter: false
            },
            toolbar: {
                bg: '#F7F7F4',
                buttonGroups: [{
                        btnHeader1: 'H1',
                        btnHeader2: 'H2',
                    },
                    {
                        btnBold: 'fa-bold',
                        btnItalic: 'fa-italic',
                    },
                    {
                        btnList: 'fa-list-ul',
                        btnOrderedList: 'fa-list-ol',
                        btnRule: 'line',
                    },
                    {
                        btnBlock: 'fa-quote-left',
                        btnCode: '{ }',

                    },
                    {
                        btnLink: 'fa-link'

                    },
                    {
                        btnImage: 'fa-image'
                    },
                    {
                        btnFont: 'font-size'
                    },


                    {
                        btnEdit: 'fa-edit',
                        btnbrowse: 'fa-folder-open',
                        btnPreview: 'fa-eye',
                        btnFullscreen: 'fa-expand',
                    },
                    {
                        btnHelp: 'fa-question-circle',

                    }

                ],
            },
            onFileBrowse: function($input, aceEditor) {
                // you can access the file object 
                //of this input here. you may also validate the file type 
                // with your backend script
                if ($input[0].files[0]) {
                    var fileReader = new FileReader();
                    fileReader.onload = function(e) {
                        aceEditor.session.setValue(e.target.result);
                        aceEditor.clearSelection();
                    }

                    fileReader.readAsText($input[0].files[0]);
                }
            },
            onPreview: function(html, markdown) {

                //do something with this html    
            },
            onInput: function(text) {
                //do something with the text
            }
        },
        privateVars = {
            aceEditor: null,
            classPrefix: 'cpme-',
            snippetManager: null,
            formData: new FormData(),
            $container: null,
            $editor: null,
            $preview: null,
            options: null,
            converter: new showdown.Converter({
                ghCompatibleHeaderId: true,
                prefixHeaderId: 'cpmep-',
                parseImgDimensions: true,
                simplifiedAutoLink: true,
                strikethrough: true,
                tables: true,
                tablesHeaderId: true,
                tasklists: true,
                ghMentions: true,
                ghMentionsLink: "https://github.com/{u}",
                openLinksInNewWindow: true,
                emoji: true,
                metadata: true
            }),

            buttonActions: {
                btnHeader1: {
                    tooltip: 'Heading 1 <h1>',
                    action: 'h1'
                },
                btnHeader2: {
                    tooltip: 'Heading 2 <h2>',
                    action: 'h2'
                },

                btnBold: {
                    tooltip: 'Strong <strong> ',
                    action: 'bold'
                },
                btnItalic: {
                    tooltip: 'Empasise <em>',
                    action: 'italic'
                },
                btnbrowse: {
                    tooltip: 'Open a markdown file',
                    action: 'browse'
                },

                btnCode: {
                    tooltip: 'Code Sample <pre><code>',
                    action: 'code'
                },
                btnBlock: {
                    tooltip: 'Blockquote <blockquote>',
                    action: 'block'
                },


                btnList: {
                    tooltip: 'Bulleted list <ul>',
                    action: 'ul'
                },
                btnOrderedList: {
                    tooltip: 'Numbered list <ol>',
                    action: 'ol'
                },
                btnRule: {
                    tooltip: 'Horizontal rule <hr>',
                    action: 'rule'
                },
                btnLink: {
                    tooltip: 'Hyperlink <a>',
                    action: 'link'
                },
                btnImage: {
                    tooltip: 'Insert image <img>',
                    action: 'image'
                },
                btnFont: {
                    tooltip: '',
                    action: 'font'
                },
                btnEdit: {
                    tooltip: 'Edit',
                    action: 'edit'
                },
                btnPreview: {
                    tooltip: 'Preview',
                    action: 'preview'
                },
                btnFullscreen: {
                    tooltip: 'Fullscreen',
                    action: 'fullscreen'
                },
                btnHelp: {
                    tooltip: 'Toggle markdown help',
                    action: 'help'
                },

            },

            helpList: {
                links: {
                    label: "Links",
                    help: "To use links in your markdown text you just have to  use <span> http://codeparl.com - automatic! <br> [a link](https://www.codeparl.com/) <br> Format: [text](url)</span>"
                },
                images: {
                    label: "Images",
                    help: "Images are exactly like links, but they have an exclamation mark before  them:<br>" +
                        "<span> ![CodeParl logo](https://codeparl.com/storage/images/logo.png) <br> Format: ![Alt Text](url)</span>" +
                        "The word in square brackets is the alt text, which gets displayed if the browser can't show the image. "
                },
                styling: {
                    label: "Styling/Heading",
                    help: "<span> *This is italicized*, and so <br> is _this_. <br> **This is bold**, just like __this__." +
                        "<br>You can ***combine*** them if you ___really have to___.</span>" +
                        "To break your text into sections, you can use headers: <span>" +
                        "A Large Header<br>============== <br><br>Smaller Subheader<br>-----------------" +
                        "</span>Use hash marks if you need several levels of headers: <span>" +
                        "# Header 1 #<br> ## Header 2 ##<br>### Header 3 ###</span> Use dashes if you need a " +
                        "horizontal rule <span>----------</span>"
                },
                lists: {
                    label: "Lists",
                    help: "Both bulleted and numbered lists are possible:<span>- Use a minus sign for a bullet<br>" +
                        "+ Or plus sign<br>* Or an asterisk<br><br>1. Numbered lists are easy<br>2. Markdown keeps track of" +
                        "the numbers for you<br>7. So this will be item 3.<hr>1. Lists in a list item:" +
                        "<br> - Indented four spaces.<br> * indented eight spaces.<br>- Four spaces again.<br>" +
                        "2.  You can have multiple<br>  paragraphs in a list items. <br>Just be sure to indent."
                }
            },

            commands: {
                bold: {
                    name: 'bold',
                    bindKey: { win: 'Ctrl-B', mac: 'Command-B' },
                    exec: function() {
                        var selectedText = privateVars.aceEditor.session.getTextRange(privateVars.aceEditor.getSelectionRange());
                        if (selectedText.trim().length === 0) {
                            privateVars.snippetManager.insertSnippet(privateVars.aceEditor, '**${1:text}**');
                            privateVars.aceEditor.find('text');
                        } else {
                            privateVars.snippetManager.insertSnippet(privateVars.aceEditor, '**' + selectedText + '**');
                        }
                        privateVars.aceEditor.focus();
                    },
                    readOnly: false
                },

                italic: {
                    name: 'italic',
                    bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
                    exec: function() {
                        var selectedText = privateVars.aceEditor.session.getTextRange(privateVars.aceEditor.getSelectionRange());
                        if (selectedText === '') {
                            privateVars.snippetManager.insertSnippet(privateVars.aceEditor, '*${1:text}*');
                            privateVars.aceEditor.find('text');
                        } else {
                            privateVars.snippetManager.insertSnippet(privateVars.aceEditor, '*' + selectedText + '*');

                        }

                        privateVars.aceEditor.focus();
                    },
                    readOnly: false
                },
                link: {
                    name: 'link',
                    bindKey: { win: 'Ctrl-K', mac: 'Command-K' },
                    exec: function() {
                        var $modal = urlModal({ title: 'Enter Url', body: urlInputs() })
                            .modal('show');
                        getEntredUrl($modal, true);
                    },
                    readOnly: false
                }
            } //end commands 
        }

    function Plugin(element, options) {

        this.element = element;
        // use extend to merge contents of defaults, user options, and private variables
        this._defaults = $.extend(true, {}, defaults, options);
        this._variables = privateVars;
        this._name = namespace;
        this.init();

    };

    Plugin.prototype = {

        init: function() {

            var main = this;
            plugin = main;
            var options = main._defaults,
                vars = main._variables;


            main._variables.$editor = $(main.element);
            main._variables.$container = $(main.element).parent();

            main._variables.$container.addClass('w-100 border cpmd-container position-relative ').css({
                backgroundColor: "#F7F7F4"
            });




            if (options.previewOnly) {
                //add the preview panel 
                main._variables.$editor = main._variables.$preview;
                this._preview(options.markdown);
            } else {
                main._variables.$preview = $('<div>').addClass('cpme-preview w-100 markdown-body overflow-auto p-2 bg-white border').hide()
                    .appendTo(vars.$container).css({
                        height: options.editor.editorHeight + 'px'
                    });

                main._variables.$editor.css({
                    height: options.editor.editorHeight + 'px'
                }).addClass('cpme-editor w-100');
                var $toolbar = this._toolbar();
                $toolbar.prependTo(main._variables.$container);
                $toolbar.append($('<div>').addClass('clearfix'));

                //hide/show the help-bar
                if (options.help.show)
                    this._helpBar().insertAfter($toolbar);



                main._variables.aceEditor = this._buildAceEditor();
                this._triggerEditorActions();
            }


        },
        _view: function(edit, $thisBtn) {
            var main = this;
            var options = main._defaults;
            var vars = main._variables;

            if (edit) {
                vars.$editor.show();
                vars.$preview.hide();
                $('.cpme-btn-normal')
                    .prop('disabled', false)
                    .removeClass('disabled');
            } else {
                vars.$editor.hide();
                vars.$preview.show();
                var markdown = vars.aceEditor.session.getValue();
                var html = vars.converter.makeHtml(markdown);
                //options.onPreview(disableJs(html), markdown);
                vars.$preview.html(this._disableJs(html));
                if (window.Prism)
                    Prism.highlightAllUnder(vars.$preview[0]);
                $('.cpme-btn-normal')
                    .prop('disabled', true)
                    .addClass('disabled');
            }
            $thisBtn.addClass('active');
            $thisBtn.siblings('button').removeClass('active');
        },
        _disableJs: function(html) {
            var main = this;

            if (!main._defaults.content.allowScript) {
                return html.replace("<script>", '&lt;script&gt;');
            }

        },
        _browseMarkdown: function($input) {
            var main = this;
            $input.on('change.' + namespace, function() {
                main._defaults.onFileBrowse($input, main._variables.aceEditor);
            });


        },
        _triggerEditorActions: function() {
            var main = this;
            var options = main._defaults;
            var vars = main._variables;
            vars.$container.find('.cpme-toolbar .cpme-btn').each(function() {
                $(this).on('click.' + namespace, function(e) {
                    e.preventDefault();
                    var $thisBtn = $(this);
                    var action = $thisBtn.data('action');

                    //hide all tooltips
                    $('[data-original-title]').tooltip('hide');

                    switch (action) {
                        case 'help':
                            $('.cpme-help-bar').slideToggle('fast');
                            break;
                        case 'preview':
                            main._view(false, $thisBtn);
                            break;
                        case 'edit':
                            main._view(true, $thisBtn);
                            break;
                        case 'browse':
                            var $input = $thisBtn.next('.cpme-file-browser');
                            main._browseMarkdown($input);
                            $input.trigger('click.' + namespace);
                            break;
                        case 'fullscreen':
                            $('body').toggleClass('cpme-fullscreen');
                            vars.$container.toggleClass('fullscreen');
                            $thisBtn.find('i').toggleClass('fa-expand fa-compress');

                            if ($thisBtn.find('i').hasClass('fa-expand'))
                                $thisBtn.attr('data-original-title', 'Fullscreen');
                            else
                                $thisBtn.attr('data-original-title', 'Restore');
                            break;
                        case 'h1':
                            main._insertText('# ', 'type your heading here');
                            break;
                        case 'h2':
                            main._insertText('## ', 'type your heading here');
                            break;
                        case 'ul':
                            main._insertText('* ', 'type your item here');
                            break;
                        case 'ol':
                            main._insertText('1. ', 'type your item here');
                            break;
                        case 'rule':
                            main._insertText('----------', 'rule');
                            break;
                        case 'block':
                            main._insertText('> ', 'type here');
                            break;
                        case 'code':
                            main._insertText('``', 'enter code here');
                            break;
                        case 'bold':
                            vars.aceEditor.execCommand('bold');
                            break;
                        case 'italic':
                            vars.aceEditor.execCommand('italic');
                            break;
                        case 'link':
                            // addLink().slideDown('fast');
                            // $thisBtn.toggleClass('bg-white').parent('div').toggleClass('bg-white');
                            // if (!$thisBtn.hasClass('bg-white'))
                            //     $('.cpme-modal').hide(function() {
                            //         $(this).remove();
                            //     });

                            break;
                        case 'image':
                            // imagePanel().slideDown('fast');
                            // $thisBtn.toggleClass('bg-white').parent('div').toggleClass('bg-white');
                            // if (!$thisBtn.hasClass('bg-white'))
                            //     $('.cpme-modal').hide(function() {
                            //         $(this).remove();
                            //     });
                            // browseImage();
                            break;

                        default:


                    }
                })


            });


        },
        _helpBar: function() {
            var main = this;
            var options = main._defaults;
            var vars = main._variables;
            var $hbar = $('<div>');
            $hbar.addClass(vars.classPrefix + 'help-bar  w-100   mx-auto py-0 ');

            for (var k in vars.helpList) {
                $('<button>').attr({ type: 'button', "data-key": k })
                    .addClass('btn btn-sm btn-default cpme-help-btn shadow-none ')
                    .text(vars.helpList[k].label)
                    .appendTo($hbar).on('click.' + namespace, function() {
                        $(this).siblings('.cpme-help-btn').removeClass('cpmd-yellow');

                        var $info = $('.' + vars.classPrefix + 'help-bar-info');
                        $info.css({
                            top: $hbar.height(),
                            height: options.editor.editorHeight + 'px'
                        });
                        $info.html($('<p>').addClass('p-4 mx-auto ')
                            .html(vars.helpList[$(this).data('key')].help));

                        $info.attr('data-key', $(this).data('key'));

                        if ($info.is(':hidden')) {
                            $info.slideDown('fast');
                        }

                        if ($(this).hasClass('cpmd-yellow'))
                            $info.slideUp('fast');

                        $(this).toggleClass('cpmd-yellow');
                    });

            }
            $('<div>')
                .addClass(vars.classPrefix + 'help-bar-info  w-100   mx-auto py-0 ')
                .appendTo($hbar).hide();

            $('<a>').attr({
                    href: options.help.link.url,
                    target: "_blank"
                }).text(options.help.link.text)
                .addClass('btn btn-link cpme-help-link float-right')
                .appendTo($hbar);

            return $hbar;
        },

        _insertText: function(code, holder) {
            var main = this;
            var options = main._defaults;
            var vars = main._variables;

            var selectedText = vars.aceEditor.session.getTextRange(vars.aceEditor.getSelectionRange()) || '';
            selectedText.trim();
            var range = vars.aceEditor.find(holder, {
                wrap: true,
                caseSensitive: true,
                wholeWord: true,
                regExp: false,
                preventScroll: true // do not change selection
            });

            if (holder === 'rule') {
                vars.aceEditor.insert(code);
                vars.aceEditor.navigateLineEnd();
                return;
            }

            if (range !== null) {
                vars.aceEditor.session.replace(range, holder);
            } else {
                if (vars.aceEditor.getCursorPosition().column === 0) {

                    if (code === '``')
                        vars.aceEditor.insert('`' + holder + '`');
                    else
                        vars.aceEditor.insert(code + holder + '');

                } else {
                    if (selectedText.length > 0) {
                        range = vars.aceEditor.getSelectionRange();
                        //obtain selection range
                        if (code === '``') {
                            vars.aceEditor.insert('`' + selectedText + '`');
                            vars.aceEditor.session.replace(range, '`' + selectedText + '`');
                        } else {
                            vars.aceEditor.session.replace(range, code + selectedText);
                        } //if-code

                    } else {
                        vars.aceEditor.navigateLineStart();
                        if (code === '``')
                            vars.aceEditor.insert('`' + holder + '`');
                        else
                            vars.aceEditor.insert(code + holder + ' ');
                        vars.aceEditor.navigateLineEnd();
                    } //if-text
                } //if-column
            }
            if (selectedText.trim().length === 0)
                vars.aceEditor.find(holder);
            vars.aceEditor.focus();
        },
        markdown: function(text) {
            var main = this;
            if (main._variables.aceEditor === null)
                return;

            if (text === undefined)
                return main._variables.aceEditor.getValue();
            else
                main._variables.aceEditor.session.setValue(text + '');

        },
        htmlContent: function() {
            var main = this;
            var html = main._variables.converter.makeHtml(main._variables.aceEditor.session.getValue());
            return html;
        },
        editor: function() {
            return this._variables.aceEditor;
        },
        _preview: function(markdown) {
            var main = this;
            var options = main._defaults;
            var vars = main._variables;
            //add the preview panel 
            vars.$preview = $(main.element).addClass('cpme-preview markdown-body overflow-auto p-2 bg-white border')
                .appendTo(vars.$container).css({
                    height: options.editor.editorHeight + 'px',
                    width: options.editor.editorWidth
                });
            var html = vars.converter.makeHtml(markdown || '');
            vars.$preview.html(this._disableJs(html));
            if (window.Prism)
                Prism.highlightAllUnder(vars.$preview[0]);

        },
        _addGroup: function($toolbar) {
            return $('<div>')
                .addClass('btn-group cpme-btn-group   mr-1')
                .appendTo($toolbar);
        },
        _toolbar: function() {
            var main = this;
            var options = main._defaults;
            var vars = main._variables;

            var $toolbar = $('<div>')
                .addClass('cpme-toolbar border-bottom p-1 ').css({
                    backgroundColor: options.toolbar.bg
                });

            for (const index in options.toolbar.buttonGroups) {
                var group = options.toolbar.buttonGroups[index];
                var $btnGroup = this._addGroup($toolbar);
                for (const k in group) {
                    if (vars.buttonActions.hasOwnProperty(k)) {
                        var $button = $('<button>')
                            .addClass('btn btn-sm  cpme-btn')
                            .attr({ "data-action": vars.buttonActions[k].action, type: 'button' })
                            .attr('title', vars.buttonActions[k].tooltip);

                        if (group[k].match(/^(fa\-.+?)$/) === null)
                            $button.text(group[k]);
                        else {

                            if (options.fullscreen === false && k === 'btnFullscreen')
                                continue;

                            $button.html($('<i>').addClass('fa ' + group[k]));

                        }


                        $btnGroup.append($button);

                        if (k === 'btnHelp') {
                            if (options.help.show)
                                $btnGroup.addClass(vars.classPrefix + 'md-help   ');
                            else $btnGroup.remove();

                        }

                        if (k === 'btnRule') {
                            $button.html($('<span>').addClass('cpme-rule'));
                            $button.addClass('cpme-rule-btn')
                        }

                        if (k === 'btnFont') {
                            $btnGroup.html(this._addFontList());
                        }


                        if (k === 'btnEdit') {
                            $button.addClass('active');
                        }

                        if ($.inArray(k, ['btnEdit', 'btnPreview', 'btnHelp']) !== -1) {
                            if (k !== 'btnHelp')
                                $button.append($('<span>').text(vars.buttonActions[k].tooltip))
                        } else {
                            $button.addClass('cpme-btn-normal');
                        }
                        if (k === 'btnFullscreen') $button.removeClass('cpme-btn-normal');

                        if (k === 'btnbrowse') {

                            $("<input>").attr({
                                    type: 'file',
                                    accept: ".md, .markdown",
                                }).addClass('cpme-file-browser ')
                                .hide().insertAfter($button);

                        }

                        if (typeof $().tooltip === 'function')
                            $button.tooltip();
                    } //end if
                } //end for
            } //end for

            $toolbar.find('.cpme-btn-group:lt(5)')
                .wrapAll('<div class="cpme-wrapper-1  animated d-inline-block ">');

            $('<button>').addClass('btn cpme-more py-0 my-0').append($('<i>').addClass('fa fa-bars '))
                .insertAfter($($toolbar.find('.cpme-wrapper-1')));

            $toolbar.find('.cpme-btn-group:gt(6)')
                .wrapAll('<div class="cpme-wrapper-2  float-right ">');

            $toolbar.find('.cpme-more').on('click.' + namespace, function() {
                if ($(this).hasClass('bg-on'))
                    $('.cpme-wrapper-1')
                    .removeClass('slideInRight')
                    .addClass('slideOutRight');
                else
                    $('.cpme-wrapper-1')
                    .removeClass('slideOutRight')
                    .addClass('slideInRight');

                $(this).toggleClass('bg-on');

            });

            return $toolbar;

        },
        _addFontList: function() {
            var main = this;
            var options = main._defaults;
            var vars = main._variables;
            var $select = $('<select>')
                .addClass('custom-select cpme-font-size py-1 ')
                .on('change.' + namespace, function() {
                    vars.aceEditor.
                    setOption('fontSize', options.editor.fontSizes[$(this).val()]);
                });

            for (const key in options.editor.fontSizes) {
                var $option = $('<option>').text(key).appendTo($select);
                if (key === options.editor.defaultFont)
                    $option.attr('selected', 'selected');
            }
            return $select;

        },
        _buildAceEditor: function() {
            var main = this;
            var options = main._defaults;
            var vars = main._variables;

            var $editor = $(main.element);
            var aceEditor = ace.edit($editor.get(0));
            aceEditor.setTheme('ace/theme/' + options.editor.theme);
            aceEditor.getSession().setMode('ace/mode/markdown');
            aceEditor.getSession().setUseWrapMode(true);
            aceEditor.getSession().setUseSoftTabs(options.editor.softTabs);
            aceEditor.setOptions({
                showGutter: options.editor.showGutter
            });
            aceEditor.getSession().setValue("");
            aceEditor.setOption('fontSize', options.editor.fontSizes[options.editor.defaultFont]);

            ace.config.loadModule('ace/ext/language_tools', function() {
                main._variables.snippetManager = ace.require('ace/snippets').snippetManager;
                aceEditor.commands.addCommand(vars.commands.bold);
                aceEditor.commands.addCommand(vars.commands.italic);
                aceEditor.commands.addCommand(vars.commands.link);
            });
            aceEditor.on('input', function() {
                options.onInput(aceEditor.getValue());
            });

            return aceEditor;
        }
    };

    $.fn[namespace] = function(options) {
        var args = arguments;

        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                if (!$.data(this, namespace)) {
                    $.data(this, namespace, new Plugin(this, options));
                }
            });
        } else if (typeof options === 'string' && options && options[0] !== '_' !== 'init') {
            var returns;
            this.each(function() {
                var instance = $.data(this, namespace);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
                if (options === 'destroy') {
                    $.data(this, namespace, null);
                }
            });
            return returns !== undefined ? returns : this;
        } else {
            //the developer passed a wrong method name

            $.error("The method " + options + " does not exist on " + namespace);

        }
    };



})(window, document);