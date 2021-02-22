(function($) {

    "use strict";



    //define the mehods 
    var namespace = 'codeparlMarkdown';
    var aceEditor = null,
        classPrefix = 'cpme-',
        urlRegex = /((https?:\/\/|ftp:\/\/|www\.|[^\s:=]+@www\.).*?[a-z_\/0-9\-\#=&])(?=(\.|,|;|\?|\!)?("|'|«|»|\[|\s|\r|\n|$))/ig,
        snippetManager = null;
    var $container = null;
    var $editor, $preview;
    var options = null;
    var converter = new showdown.Converter();

    var buttonActions = {
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
            tooltip: 'Show markdown help',
            action: 'help'
        },

    }; //end buttonActions

    var helpList = {
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
    };

    var commands = {
        bold: {
            name: 'bold',
            bindKey: { win: 'Ctrl-B', mac: 'Command-B' },
            exec: function() {
                var selectedText = aceEditor.session.getTextRange(aceEditor.getSelectionRange());
                if (selectedText.trim().length === 0) {
                    snippetManager.insertSnippet(aceEditor, '**${1:text}**');
                    aceEditor.find('text');
                } else {
                    snippetManager.insertSnippet(aceEditor, '**' + selectedText + '**');
                }
                aceEditor.focus();
            },
            readOnly: false
        },

        italic: {
            name: 'italic',
            bindKey: { win: 'Ctrl-I', mac: 'Command-I' },
            exec: function() {
                var selectedText = aceEditor.session.getTextRange(aceEditor.getSelectionRange());
                if (selectedText === '') {
                    snippetManager.insertSnippet(aceEditor, '*${1:text}*');
                    aceEditor.find('text');
                } else {
                    snippetManager.insertSnippet(aceEditor, '*' + selectedText + '*');

                }

                aceEditor.focus();
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
    }; //end commands 




    function getEntredUrl($modal, isLink) {
        var text = '',
            url = '';
        var $inputs = $modal.find('input');
        var selectedText = aceEditor.session.getTextRange(aceEditor.getSelectionRange());

        if (selectedText.trim().length > 0)
            $inputs.eq(0).val(selectedText);

        $modal.find('.modal-footer button.btn-success').on('click.' + namespace, function() {
            text = $inputs.eq(0).val();
            url = $inputs.eq(1).val();
            if (url.length > 0 && text.length > 0) {
                $modal.modal('hide');
                if (isLink)
                    snippetManager.insertSnippet(aceEditor, '[' + text + '](' + url + ')');
                else
                    snippetManager.insertSnippet(aceEditor, '![' + text + '](' + url + ')');
            } else {
                shake($modal);
            }
        });


    }

    function insertText(code, holder) {
        var selectedText = aceEditor.session.getTextRange(aceEditor.getSelectionRange()) || '';
        selectedText.trim();
        var range = aceEditor.find(holder, {
            wrap: true,
            caseSensitive: true,
            wholeWord: true,
            regExp: false,
            preventScroll: true // do not change selection
        });

        if (holder === 'rule') {
            aceEditor.insert(code);
            aceEditor.navigateLineEnd();
            return;
        }

        if (range !== null) {
            aceEditor.session.replace(range, holder);
        } else {
            if (aceEditor.getCursorPosition().column === 0) {

                if (code === '``')
                    aceEditor.insert('`' + holder + '`');
                else
                    aceEditor.insert(code + holder + '');

            } else {
                if (selectedText.length > 0) {
                    range = aceEditor.getSelectionRange();
                    //obtain selection range
                    if (code === '``') {
                        aceEditor.insert('`' + selectedText + '`');
                        aceEditor.session.replace(range, '`' + selectedText + '`');
                    } else {
                        aceEditor.session.replace(range, code + selectedText);
                    } //if-code

                } else {
                    aceEditor.navigateLineStart();
                    if (code === '``')
                        aceEditor.insert('`' + holder + '`');
                    else
                        aceEditor.insert(code + holder + ' ');
                    aceEditor.navigateLineEnd();
                } //if-text
            } //if-column
        }
        if (selectedText.trim().length === 0)
            aceEditor.find(holder);
        aceEditor.focus();
    }

    function urlModal(options) {

        if ($.type($().modal) !== 'function')
            $.error('bootstrap.min.js is required for this plugin');

        var $modal = '<div class="modal fade " data-backdrop="false" id="' + namespace + '-modal"  tabindex="-1" role="dialog">';
        $modal += '<div class="modal-dialog   " role="document">';
        $modal += '<div class="modal-content">';
        $modal += '<div class="modal-header ">';
        $modal += '<h4 class="modal-title text-capitalize "> ' + options.title + '</h4>';
        $modal += ' <button type="button" class="close" data-dismiss="modal" aria-label="Close">';
        $modal += '<span aria-hidden="true">&times;</span></button></div>';
        $modal += '<div class="modal-body"></div>';
        $modal += '<div class="modal-footer mx-auto text-center w-100"><button class="btn btn-sm btn-success">OK</button>';
        $modal += '<button data-dismiss="modal" class="btn btn-sm btn-danger">cancel</button></div> ';
        $modal += '</div></div> </div>';
        $modal = $($modal).on('hidden.bs.modal', function() {
            $(this).remove();
        });
        $modal.find('.modal-body').html(options.body);

        notifyByShake($modal);
        return $modal;


    }

    function notifyByShake($modal) {
        $modal.on('click.' + namespace, function(e) {
            if (!$(e.target).is('.modal-dialog *')) {
                shake($modal);
            }
        });
    }

    function urlInputs(text, url) {
        text = (!text ? "Text" : text);
        url = (!url ? "URL" : url);
        var inputText = $('<input>').attr({ type: 'text', placeholder: 'Enter ' + text }).prop('required', true)
            .addClass('form-control form-control-sm');
        inputText = $('<label>').addClass('w-100').text(text + ":").append(inputText);

        var inputUrl = $('<input>').attr({ type: url, placeholder: 'Enter ' + url }).prop('required', true)
            .addClass('form-control form-control-sm');
        inputUrl = $('<label>').addClass('w-100').text(url + ':').append(inputUrl);

        return $('<div>').append(inputText)
            .append(inputUrl);

    }

    function addGroup($toolbar) {
        return $('<div>')
            .addClass('btn-group cpme-btn-group   mr-1')
            .appendTo($toolbar);
    }

    function view(edit, $thisBtn) {
        if (edit) {
            $editor.show();
            $preview.hide();
            $('.cpme-btn-normal')
                .prop('disabled', false)
                .removeClass('disabled');
        } else {
            $editor.hide();
            $preview.show();
            var markdown = aceEditor.session.getValue();

            markdown = convertToLink(markdown);
            var html = converter.makeHtml(markdown);
            options.onPreview(disableJs(html), markdown);
            $preview.html(disableJs(html));
            $('.cpme-btn-normal')
                .prop('disabled', true)
                .addClass('disabled');
        }
        $thisBtn.addClass('active');
        $thisBtn.siblings('button').removeClass('active');
    }

    function browseMarkdown($input) {
        $input.on('change.' + namespace, function() {
            options.onFileBrowse($input, aceEditor);
        });


    }

    function disableJs(html) {
        if (!options.allowScript) {
            return html.replace("<script>", '&lt;script&gt;');
        }

    }

    function shake($model) {
        $model.find('.modal-content').addClass(' animated fast headShake');
        setTimeout(function() {
            $model.find('.modal-content').removeClass('animated fast headShake')
        }, 1000);
    }


    function triggerEditorActions() {
        $container.find('.cpme-toolbar .cpme-btn').each(function() {
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
                        view(false, $thisBtn);
                        break;
                    case 'edit':
                        view(true, $thisBtn);
                        break;
                    case 'browse':
                        var $input = $thisBtn.next('.cpme-file-browser');
                        browseMarkdown($input);
                        $input.trigger('click.' + namespace);
                        break;
                    case 'fullscreen':

                        $('body').toggleClass('cpme-fullscreen');
                        $container.toggleClass('fullscreen');
                        $thisBtn.find('i').toggleClass('fa-expand fa-compress');
                      


                        if ($thisBtn.find('i').hasClass('fa-expand'))
                            $thisBtn.attr('data-original-title', 'Fullscreen');
                        else
                            $thisBtn.attr('data-original-title', 'Restore');


                        break;
                    case 'h1':
                        insertText('# ', 'type your heading here');
                        break;
                    case 'h2':
                        insertText('## ', 'type your heading here');
                        break;
                    case 'ul':
                        insertText('* ', 'type your item here');
                        break;
                    case 'ol':
                        insertText('1. ', 'type your item here');
                        break;
                    case 'rule':
                        insertText('----------', 'rule');
                        break;
                    case 'block':
                        insertText('> ', 'type here');
                        break;
                    case 'code':
                        insertText('``', 'enter code here');
                        break;
                    case 'bold':
                        aceEditor.execCommand('bold');
                        break;
                    case 'italic':
                        aceEditor.execCommand('italic');
                        break;
                    case 'link':
                        aceEditor.execCommand('link');
                        break;
                    case 'image':
                        var $modal = urlModal({ title: 'Enter Image URL', body: urlInputs('Alt Text') })
                            .modal('show');
                        getEntredUrl($modal, false);
                        break;

                    default:


                }
            })


        });


    }

    function toolbar() {
        var $toolbar = $('<div>')
            .addClass('cpme-toolbar border-bottom p-1 ').css({
                backgroundColor: options.toolbar.bg
            });

        for (const index in options.toolbar.buttonGroups) {
            var group = options.toolbar.buttonGroups[index];
            var $btnGroup = addGroup($toolbar);
            for (const k in group) {
                if (buttonActions.hasOwnProperty(k)) {
                    var $button = $('<button>')
                        .addClass('btn btn-sm  cpme-btn')
                        .attr({ "data-action": buttonActions[k].action, type: 'button' })
                        .attr('title', buttonActions[k].tooltip);

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
                            $btnGroup.addClass(classPrefix + 'md-help float-right  ');
                        else $btnGroup.remove();

                    }

                    if (k === 'btnRule') {
                        $button.html($('<span>').addClass('cpme-rule'));
                        $button.addClass('cpme-rule-btn')
                    }

                    if (k === 'btnEdit') {
                        $btnGroup.addClass('float-right');
                        $button.addClass('active');
                    }

                    if ($.inArray(k, ['btnEdit', 'btnPreview', 'btnHelp']) !== -1) {
                        if (k !== 'btnHelp')
                            $button.append($('<span>').text(buttonActions[k].tooltip))
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

        return $toolbar;
    }


    function helpBar() {

        var $hbar = $('<div>');
        $hbar.addClass(classPrefix + 'help-bar  w-100   mx-auto py-0 ');

        for (var k in helpList) {
            $('<button>').attr({ type: 'button', "data-key": k })
                .addClass('btn btn-sm btn-default cpme-help-btn shadow-none ')
                .text(helpList[k].label)
                .appendTo($hbar).on('click.' + namespace, function() {
                    $(this).siblings('.cpme-help-btn').removeClass('cpmd-yellow');

                    var $info = $('.' + classPrefix + 'help-bar-info');
                    $info.css({
                        top: $hbar.height(),
                        height: options.editor.editorHeight
                    });
                    $info.html($('<p>').addClass('p-4 mx-auto ')
                        .html(helpList[$(this).data('key')].help));

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
            .addClass(classPrefix + 'help-bar-info  w-100   mx-auto py-0 ')
            .appendTo($hbar).hide();

        $('<a>').attr({
                href: options.help.link.url,
                target: "_blank"
            }).text(options.help.link.text)
            .addClass('btn btn-link cpme-help-link float-right')
            .appendTo($hbar);

        return $hbar;
    }

    function convertToLink(text) {
        var urls = text.match(urlRegex);
        if (!urls || urls === null) return text;

        if (urls.length > 0) {
            for (let index = 0; index < urls.length; index++) {
                var thisUrl = urls[index];
                if (thisUrl.search(/https?/) == -1)
                    thisUrl = 'http://' + thisUrl;

                var url = '[' + thisUrl + '](' + thisUrl + ')';
                text = text.replace(urls[index], url);
            }
        }
        return text;
    }

    function buildAceEditor() {
        aceEditor = ace.edit($editor.get(0));
        aceEditor.setTheme('ace/theme/' + options.editor.theme);
        aceEditor.getSession().setMode('ace/mode/markdown');
        aceEditor.getSession().setUseWrapMode(true);
        aceEditor.getSession().setUseSoftTabs(options.editor.softTabs);
        aceEditor.setOptions({
            fontSize: options.editor.fontSize,
            showGutter: options.editor.showGutter
        });

        ace.config.loadModule('ace/ext/language_tools', function() {
            snippetManager = ace.require('ace/snippets').snippetManager;
            aceEditor.commands.addCommand(commands.bold);
            aceEditor.commands.addCommand(commands.italic);
            aceEditor.commands.addCommand(commands.link);
        });
    }

    var methods = {
        init: function(option) {

            //first merge the options  
            options = $.extend(true, {}, $.fn.codeparlMarkdown.defaults, option);
            $editor = this;
            $editor.addClass('w-100');
            //store the settings of the element
            var isInitialized = this.filter(function() {
                return $(this).data(namespace)
            }).length > 0;


            if (isInitialized) {
                $.error('The plugin has already been initialized.');
            }

            this.data(namespace, options);

            this.css({
                height: options.editor.editorHeight
            }).addClass('cpme-editor');
            //now we can define the logic of the plugin

            $container = this.parent();
            $container.addClass('w-100 border cpmd-container ').css({
                backgroundColor: "#F7F7F4"
            });

            var $toolbar = toolbar(options);

            $toolbar.prependTo($container);
            $toolbar.append($('<div>').addClass('clearfix'));

            //hide/show the help-bar
            if (options.help.show) {
                helpBar().insertAfter($toolbar);

            }


            //add the preview panel 
            $preview = $('<div>').addClass('cpme-preview w-100 markdown-body overflow-auto p-2 bg-white border').hide()
                .appendTo($container).css({
                    height: options.editor.editorHeight
                });

            //initialize the ace editor for our markdown 
            buildAceEditor(options);
            triggerEditorActions(options);

            return this;
        },

        markdownContent: function(markdown) {
            if (!markdown) {
                return convertToLink(aceEditor.getValue());
            } else {
                aceEditor.session.setValue(markdown);
                aceEditor.clearSelection();
            }


        },

        htmlContent: function() {
            var html = converter.makeHtml(convertToLink(aceEditor.session.getValue()));
            return html;
        },
        preview: function(markdown, options) {
            if (markdown) {
                options = $.extend(true, {}, $.fn.codeparlMarkdown.defaults, options);
                //add the preview panel 
                $container = this.parent();
                $preview = $('<div>').addClass('cpme-preview markdown-body overflow-auto p-2 bg-white border')
                    .appendTo($container).css({
                        height: options.editorHeight,
                        width: options.editorWidth
                    });
                if (markdown.trim().length > 0) {
                    var html = converter.makeHtml(markdown || '');
                    this.html($preview.html(disableJs(html)));
                }
            }

        },
        destroy: function() {}
    };

    //bind our plugin with jquery

    $.fn.codeparlMarkdown = function(options) {

        //the developer passed a method name
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));

        }
        //the developer passed an object for options 
        else if ($.type(options) === 'object' || !options) {

            return methods.init.apply(this, arguments);

        }
        //the developer passed a wrong method name
        else {
            $.error("The method " + options + " does not exist on " + namespace);
        }
    }


    //bind our default options to jquery 
    $.fn.codeparlMarkdown.defaults = {
        fullscreen: true,
        content: {
            allowScript: false,
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
            editorHeight: '500px',
            editorWidth: '100%',
            fontSize: 16,
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
                    btnLink: 'fa-link',
                    btnImage: 'fa-image',
                },
                {
                    btnHelp: 'fa-question-circle',

                },
                {
                    btnEdit: 'fa-edit',
                    btnbrowse: 'fa-folder-open',
                    btnPreview: 'fa-eye',
                    btnFullscreen: 'fa-expand',
                },

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
        }

    };


})(jQuery);