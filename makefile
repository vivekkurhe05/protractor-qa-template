CURRENT_DATE = `date '+%B %d, %Y%n'`
GIT_HEAD = `git rev-parse --short HEAD`
NO_COMMITS = `git rev-list --count HEAD`
CONTRIBUTORS = `git log --pretty="%an %ae%n%cn %ce" | sort | uniq)`


FLAGS = --standalone                           \
        --toc                                  \
		--toc-depth=2		                   \
		--highlight-style pygments             \
		-V colorlinks                          \
		-V current_date="$(CURRENT_DATE)"      \
		-V git_head="$(NO_COMMITS).$(GIT_HEAD)"  
		

pdfoutput = out.pdf

LTEMPLATE = page.tex

pull-docker-image:
	docker pull pandoc/latex:latest


docker-build-pdf:
	docker run -ti --rm  -v $(PWD):/data -w /data pandoc/latex -f markdown $(FLAGS) -o $(pdfoutput) --template $(LTEMPLATE) --pdf-engine=xelatex  metadata.yml chapters/*.md

.PHONY : pull-docker-image docker-build-pdf
