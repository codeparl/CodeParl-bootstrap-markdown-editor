(function($) {

    "use strict";



    //define the mehods 
    var namespace = 'codeparlMarkdown';
    var aceEditor = null,
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


    }; //end buttonActions

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

        var range = aceEditor.find(holder, {
            wrap: true,
            caseSensitive: true,
            wholeWord: true,
            regExp: false,
            preventScroll: true // do not change selection
        });

        if (range !== null) {
            aceEditor.session.replace(range, holder);
        } else {
            if (aceEditor.getCursorPosition().column === 0) {
                aceEditor.navigateLineStart();
                if (code === '``')
                    aceEditor.insert('`' + holder + '` ');
                else
                    aceEditor.insert(code + holder + ' ');
                aceEditor.navigateLineEnd();
            } else {
                if (selectedText.trim().length > 0) {
                    range = aceEditor.getSelectionRange();
                    //obtain selection range
                    if (code === '``') {
                        aceEditor.insert('`' + selectedText + '` ');
                        aceEditor.session.replace(range, '`' + selectedText + '` ');
                    } else {
                        aceEditor.session.replace(range, code + selectedText);
                    } //if-code

                } else {
                    if (code === '``')
                        aceEditor.insert('`' + holder + '` ');
                    else
                        aceEditor.insert(code + holder + ' ');
                    aceEditor.navigateLineEnd();
                } //if-text
            } //if-column
        }

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
            var html = converter.makeHtml(aceEditor.session.getValue());
            options.onPreview(disableJs(html));
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
                $('[data-original-title').tooltip('hide');

                switch (action) {
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

                    if (k === 'btnEdit') {
                        $btnGroup.addClass('float-right');
                        $button.addClass('active');
                    }

                    if ($.inArray(k, ['btnEdit', 'btnPreview']) !== -1) {
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



    function buildAceEditor() {
        aceEditor = ace.edit($editor.get(0));
        aceEditor.setTheme('ace/theme/' + options.editor.theme);
        aceEditor.getSession().setMode('ace/mode/markdown');
        aceEditor.getSession().setUseWrapMode(true);
        aceEditor.getSession().setUseSoftTabs(options.editor.softTabs);
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

            //add the preview panel 
            $preview = $('<div>').addClass('cpme-preview markdown-body overflow-auto p-2 bg-white border').hide()
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
                return aceEditor.session.getvalue();
            } else {
                aceEditor.session.setValue(markdown);
                aceEditor.clearSelection();
            }


        },

        htmlContent: function() {
            var html = converter.makeHtml(aceEditor.session.getValue());
            return html;
        },
        preview: function(html) {
            options = $.fn.codeparlMarkdown.defaults;
            //add the preview panel 
            $container = this.parent();
            $preview = $('<div>').addClass('cpme-preview markdown-body overflow-auto p-2 bg-white border')
                .appendTo($container).css({
                    height: options.editor.editorHeight
                });


            this.html($preview.html(disableJs(html)));

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
        editor: {
            softTabs: true,
            theme: 'tomorrow',
            editorHeight: '500px',
            editorWidth: '100%',
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
                    btnEdit: 'fa-edit',
                    btnbrowse: 'fa-folder-open',
                    btnPreview: 'fa-eye',
                    btnFullscreen: 'fa-expand',
                }
            ],
        },
        loading: 'fa-spinner fa-spin',
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
        onPreview: function(html) {

            //do something with this html    
        }

    };


})(jQuery);