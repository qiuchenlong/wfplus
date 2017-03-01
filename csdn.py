#encoding:utf-8
import urllib.request
from bs4 import BeautifulSoup as bs


def uo(x):
    try:
        headers = {'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:23.0) Gecko/20100101 Firefox/23.0'}
        req = urllib.request.Request(x)
        html=urllib.request.urlopen(req)
        page=html.read()
        html.close()
        return bs(page,"html.parser")
    except:
        print('An error in uo')


def gettxt(url):
    s=[]
    try:
        page=uo(url)
        t=page.findAll('a',{'class':"label label-default"})
        for i in t:s.append(i.get_text())
        return s
    except:
        print('An error in gettxt')
        return 'An error in gettxt'

if __name__=='__main__':
    txt=gettxt('http://geek.csdn.net/news/detail/134835')#gettxt输入网址，返回列表
    for i in txt:print(i)